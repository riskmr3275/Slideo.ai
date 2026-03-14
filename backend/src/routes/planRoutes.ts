import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserPlan } from '../controllers/planController';

const router = Router();

router.use(authenticate);

router.get('/usage', getUserPlan);

export default router;
