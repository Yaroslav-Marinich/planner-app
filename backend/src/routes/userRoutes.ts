import { Router } from 'express';
import { syncUser, savePushToken } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/sync', verifyToken, syncUser);
router.post('/push-token', verifyToken, savePushToken);

export default router;
