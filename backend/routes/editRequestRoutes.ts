import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEditRequests, createEditRequest, updateEditRequest, approveEditRequest, rejectEditRequest } from '../controllers/editRequestController';

const router = Router();

router.use(protect);

router.get('/', getEditRequests);
router.post('/', createEditRequest);
router.put('/:id', updateEditRequest);
router.put('/:id/approve', approveEditRequest);
router.put('/:id/reject', rejectEditRequest);

export default router;