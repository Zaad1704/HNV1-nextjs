import express from 'express';
import { 
  createApprovalRequest, 
  getApprovalRequests, 
  updateApprovalStatus, 
  deleteApprovalRequest 
} from '../controllers/approvalController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Approval request routes
router.post('/', createApprovalRequest);
router.get('/', getApprovalRequests);
router.put('/:id', updateApprovalStatus);
router.delete('/:id', deleteApprovalRequest);

export default router;