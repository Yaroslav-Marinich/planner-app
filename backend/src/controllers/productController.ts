import { Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Користувач не належить до жодної сім'ї" });
      return;
    }

    const products = await Product.find({ householdId: user.householdId });
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Помилка отримання продуктів:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { name, defaultUnit, isDivisible, inStockAmount } = req.body;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Ви не можете додавати продукти без створеної сім'ї" });
      return;
    }

    if (!name || !defaultUnit) {
      res.status(400).json({ message: "Назва та одиниці виміру є обов'язковими" });
      return;
    }

    const newProduct = new Product({
      householdId: user.householdId,
      name,
      defaultUnit,
      isDivisible: isDivisible ?? false,
      inStockAmount: inStockAmount ?? 0
    });

    const savedProduct = await newProduct.save();
    console.log(`🍏 Додано новий продукт на склад: ${name}`);

    res.status(201).json({ message: 'Продукт успішно додано', product: savedProduct });
  } catch (error) {
    console.error('❌ Помилка створення продукту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Ви не можете видаляти продукти без створеної сім'ї" });
      return;
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: id,
      householdId: user.householdId
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'Продукт не знайдено' });
      return;
    }

    res.status(200).json({ message: 'Продукт успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка видалення продукту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
