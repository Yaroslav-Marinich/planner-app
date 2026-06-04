import { Router } from 'express';
import { getRecipes, createRecipe, deleteRecipe } from '../controllers/recipeController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getRecipes);
router.post('/', verifyToken, createRecipe);
router.delete('/:id', verifyToken, deleteRecipe);

export default router;
