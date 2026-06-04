import { Response } from 'express';
import Recipe from '../models/Recipe';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Користувач не належить до жодної сім'ї" });
      return;
    }

    const recipes = await Recipe.find({ householdId: user.householdId }).populate(
      'ingredients.productId',
      'name defaultUnit'
    );

    res.status(200).json(recipes);
  } catch (error) {
    console.error('❌ Помилка отримання рецептів:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const createRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { name, instructions, prepTime, basePortions, ingredients } = req.body;

    if (!uid) {
      res.status(401).json({ message: 'Неавторизовано' });
      return;
    }

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Ви не можете створювати рецепти без створеної сім'ї" });
      return;
    }

    if (!name || !basePortions || !ingredients || !Array.isArray(ingredients)) {
      res.status(400).json({ message: 'Неповні дані для створення рецепту' });
      return;
    }

    const newRecipe = new Recipe({
      householdId: user.householdId,
      authorId: uid,
      name,
      instructions,
      prepTime,
      basePortions,
      ingredients
    });

    const savedRecipe = await newRecipe.save();
    console.log(`🍳 Додано новий рецепт: ${name}`);

    res.status(201).json({ message: 'Рецепт успішно додано', recipe: savedRecipe });
  } catch (error) {
    console.error('❌ Помилка створення рецепту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const deleteRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: String(uid) });
    if (!user || !user.householdId) {
      res.status(400).json({ message: "Ви не можете видаляти рецепти без створеної сім'ї" });
      return;
    }

    const deletedRecipe = await Recipe.findOneAndDelete({ _id: id, householdId: user.householdId });
    if (!deletedRecipe) {
      res.status(404).json({ message: 'Рецепт не знайдено' });
      return;
    }

    res.status(200).json({ message: 'Рецепт успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка видалення рецепту:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
