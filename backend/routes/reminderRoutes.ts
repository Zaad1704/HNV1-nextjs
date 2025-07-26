import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} from '../controllers/reminderController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

export default router;
