import { Router } from 'express';
import {
  createHousehold,
  requestToJoin,
  respondToJoinRequest
} from '../controllers/householdController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', verifyToken, createHousehold);
router.post('/join', verifyToken, requestToJoin);
router.post('/respond', verifyToken, respondToJoinRequest);

export default router;
