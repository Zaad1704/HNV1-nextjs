import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUsers,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

router.use(protect);

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;