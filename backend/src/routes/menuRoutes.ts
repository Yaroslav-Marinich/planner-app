import { Router } from 'express';
import { getMenus, createMenu, markMealAsCooked, deleteMenu } from '../controllers/menuController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getMenus);
router.post('/', verifyToken, createMenu);
router.patch('/:menuId/meal/:mealId/cook', verifyToken, markMealAsCooked);
router.delete('/:id', verifyToken, deleteMenu);

export default router;
