import { Router } from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/productController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, createProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;
