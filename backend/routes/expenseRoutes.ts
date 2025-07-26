import express from 'express';
import { requireOrganization } from '../middleware/auth';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController-real';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getExpenses)
  .post(requireOrganization, createExpense);

router.route('/:id')
  .put(requireOrganization, updateExpense)
  .delete(requireOrganization, deleteExpense);

export default router;