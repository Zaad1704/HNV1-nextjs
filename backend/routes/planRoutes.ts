import { Router } from 'express';
import { getPlans, getPlanById } from '../controllers/planController';

const router = Router();

router.get('/', getPlans);
router.get('/:id', getPlanById);

export default router;
