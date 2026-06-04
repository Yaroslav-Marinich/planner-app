import { Response } from 'express';
import Menu from '../models/Menu';
import User from '../models/User';
import Recipe from '../models/Recipe';
import Product from '../models/Product';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getMenus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Користувач не належить до жодної сім'ї" });
      return;
    }

    const menus = await Menu.find({ householdId: user.householdId })
      .sort({ startDate: -1 })
      .populate('days.plannedMeals.recipeId', 'name prepTime');

    res.status(200).json(menus);
  } catch (error) {
    console.error('❌ Помилка отримання меню:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const createMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { name, startDate, endDate, days } = req.body;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Ви не можете планувати меню без створеної сім'ї" });
      return;
    }

    if (!name || !startDate || !endDate || !days) {
      res.status(400).json({ message: 'Неповні дані для створення меню' });
      return;
    }

    const newMenu = new Menu({
      householdId: user.householdId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days
    });

    const savedMenu = await newMenu.save();
    console.log(`📅 Створено нове меню: ${name}`);

    res.status(201).json({ message: 'Меню успішно створено', menu: savedMenu });
  } catch (error) {
    console.error('❌ Помилка створення меню:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const markMealAsCooked = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { menuId, mealId } = req.params;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) return;

    const menu = await Menu.findOne({ _id: menuId, householdId: user.householdId });
    if (!menu) {
      res.status(404).json({ message: 'Меню не знайдено' });
      return;
    }

    let targetMeal: any = null;
    for (const day of menu.days) {
      const meal = day.plannedMeals.find((m) => m._id?.toString() === mealId);
      if (meal) {
        targetMeal = meal;
        break;
      }
    }

    if (!targetMeal) {
      res.status(404).json({ message: 'Страву не знайдено у меню' });
      return;
    }

    if (targetMeal.isCooked) {
      res
        .status(400)
        .json({ message: 'Ця страва вже відмічена як приготована (продукти списано раніше)' });
      return;
    }

    const recipe = await Recipe.findById(targetMeal.recipeId);
    if (!recipe) {
      res.status(404).json({ message: 'Оригінальний рецепт не знайдено' });
      return;
    }

    const multiplier = targetMeal.portions / recipe.basePortions;

    const deductPromises = recipe.ingredients.map(async (ing) => {
      const amountToDeduct = ing.amount * multiplier;
      const product = await Product.findById(ing.productId);

      if (product) {
        product.inStockAmount = Math.max(0, product.inStockAmount - amountToDeduct);
        await product.save();
      }
    });

    await Promise.all(deductPromises);

    targetMeal.isCooked = true;
    await menu.save();

    console.log(`🍳 Страву приготовано. Продукти для рецепту ${recipe.name} списано.`);

    const io = req.app.get('io');
    io.emit('meal_cooked', { menuId, mealId });

    res
      .status(200)
      .json({ message: 'Страву приготовано, продукти успішно списано зі складу!', menu });
  } catch (error) {
    console.error('❌ Помилка списання продуктів:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const deleteMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) return;

    const deletedMenu = await Menu.findOneAndDelete({ _id: id, householdId: user.householdId });
    if (!deletedMenu) {
      res.status(404).json({ message: 'Меню не знайдено' });
      return;
    }

    res.status(200).json({ message: 'Меню успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка видалення меню:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
