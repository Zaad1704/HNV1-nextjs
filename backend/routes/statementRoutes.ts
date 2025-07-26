import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { generateTenantStatement } from '../controllers/statementController';

const router = Router();

router.use(protect);

router.get('/tenant/:tenantId', generateTenantStatement);

export default router;