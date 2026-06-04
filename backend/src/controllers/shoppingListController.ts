import { Response } from 'express';
import ShoppingList from '../models/ShoppingList';
import User from '../models/User';
import Menu from '../models/Menu';
import Recipe from '../models/Recipe';
import Product from '../models/Product';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getShoppingLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const user = await User.findOne({ firebaseUid: String(uid) });

    if (!user || !user.householdId) {
      res.status(400).json({ message: "Користувач не належить до сім'ї" });
      return;
    }

    const lists = await ShoppingList.find({
      householdId: user.householdId,
      status: 'active'
    }).populate('items.productId', 'name defaultUnit');

    res.status(200).json(lists);
  } catch (error) {
    console.error('❌ Помилка отримання списків покупок:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const createShoppingList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { items } = req.body;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Створіть або приєднайтесь до сім'ї" });
      return;
    }

    const newList = new ShoppingList({
      householdId: user.householdId,
      items
    });

    const savedList = await newList.save();
    console.log(`🛒 Створено новий список покупок для сім'ї`);

    res.status(201).json({ message: 'Список створено', list: savedList });
  } catch (error) {
    console.error('❌ Помилка створення списку:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const updateItemStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { listId, itemId } = req.params;
    const { status } = req.body;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) return;

    const list = await ShoppingList.findOneAndUpdate(
      { _id: listId, householdId: user.householdId, 'items._id': itemId } as any,
      { $set: { 'items.$.status': status } },
      { new: true }
    ).populate('items.productId', 'name');

    if (!list) {
      res.status(404).json({ message: 'Список або товар не знайдено' });
      return;
    }

    const io = req.app.get('io');
    io.emit('shopping_list_updated', { listId, itemId, status, updatedBy: uid });

    res.status(200).json({ message: 'Статус оновлено', list });
  } catch (error) {
    console.error('❌ Помилка оновлення статусу товару:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const generateFromMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { menuId } = req.body;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Створіть або приєднайтесь до сім'ї" });
      return;
    }

    const menu = await Menu.findOne({ _id: menuId, householdId: user.householdId });
    if (!menu) {
      res.status(404).json({ message: 'Меню не знайдено' });
      return;
    }

    const requiredIngredients = new Map<string, number>();

    const recipeIds = new Set<string>();
    menu.days.forEach((day) => {
      day.plannedMeals.forEach((meal) => recipeIds.add(meal.recipeId.toString()));
    });

    const recipes = await Recipe.find({ _id: { $in: Array.from(recipeIds) } });
    const recipeMap = new Map(recipes.map((r) => [r._id.toString(), r]));

    menu.days.forEach((day) => {
      day.plannedMeals.forEach((meal) => {
        const recipe = recipeMap.get(meal.recipeId.toString());
        if (!recipe) return;

        const multiplier = meal.portions / recipe.basePortions;

        recipe.ingredients.forEach((ing) => {
          const prodId = ing.productId.toString();
          const currentAmount = requiredIngredients.get(prodId) || 0;
          requiredIngredients.set(prodId, currentAmount + ing.amount * multiplier);
        });
      });
    });

    const products = await Product.find({ _id: { $in: Array.from(requiredIngredients.keys()) } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const shoppingListItems: any[] = [];

    requiredIngredients.forEach((requiredAmount, prodId) => {
      const product = productMap.get(prodId);
      const inStock = product ? product.inStockAmount : 0;

      if (requiredAmount > inStock) {
        shoppingListItems.push({
          productId: prodId,
          plannedAmount: requiredAmount - inStock,
          status: 'pending'
        });
      }
    });

    if (shoppingListItems.length === 0) {
      res.status(200).json({ message: 'На складі достатньо продуктів для цього меню!' });
      return;
    }

    const newList = new ShoppingList({
      householdId: user.householdId,
      status: 'active',
      items: shoppingListItems
    });

    const savedList = await newList.save();
    console.log(`🤖 Згенеровано розумний список покупок для меню: ${menu.name}`);

    res.status(201).json({
      message: 'Список покупок успішно згенеровано',
      list: savedList
    });
  } catch (error) {
    console.error('❌ Помилка генерації списку покупок:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const purchaseItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { listId, itemId } = req.params;
    const { boughtAmount, price } = req.body;

    if (!boughtAmount || price === undefined) {
      res.status(400).json({ message: 'Вкажіть кількість та ціну' });
      return;
    }

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) return;

    const list = await ShoppingList.findOne({ _id: listId, householdId: user.householdId });
    if (!list) {
      res.status(404).json({ message: 'Список не знайдено' });
      return;
    }

    const item = list.items.find((i) => i._id?.toString() === itemId);
    if (!item) {
      res.status(404).json({ message: 'Товар не знайдено у списку' });
      return;
    }

    item.purchases.push({
      userId: String(uid),
      boughtAmount,
      price,
      transactionSent: false
    });

    const totalBought = item.purchases.reduce((sum, p) => sum + p.boughtAmount, 0);
    item.status = totalBought >= item.plannedAmount ? 'fulfilled' : 'partially_bought';

    await list.save();

    await Product.findByIdAndUpdate(item.productId, {
      $inc: { inStockAmount: boughtAmount }
    });

    const io = req.app.get('io');
    io.emit('item_purchased', {
      listId,
      itemId,
      status: item.status,
      boughtAmount,
      newTotal: totalBought
    });

    console.log(`💰 Куплено товар ${item.productId} на суму ${price}`);
    res.status(200).json({ message: 'Покупку зафіксовано, склад поповнено', list });
  } catch (error) {
    console.error('❌ Помилка фіксації покупки:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const deleteShoppingList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) return;

    const deletedList = await ShoppingList.findOneAndDelete({
      _id: id,
      householdId: user.householdId
    });
    if (!deletedList) {
      res.status(404).json({ message: 'Список покупок не знайдено' });
      return;
    }

    const io = req.app.get('io');
    io.emit('shopping_list_deleted', { listId: id });

    res.status(200).json({ message: 'Список покупок успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка видалення списку покупок:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
