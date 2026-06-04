import { Router } from 'express';
import {
  getShoppingLists,
  createShoppingList,
  updateItemStatus,
  generateFromMenu,
  purchaseItem,
  deleteShoppingList
} from '../controllers/shoppingListController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getShoppingLists);
router.post('/', verifyToken, createShoppingList);
router.post('/generate', verifyToken, generateFromMenu);
router.patch('/:listId/item/:itemId', verifyToken, updateItemStatus);
router.post('/:listId/item/:itemId/purchase', verifyToken, purchaseItem);
router.delete('/:id', verifyToken, deleteShoppingList);

export default router;
