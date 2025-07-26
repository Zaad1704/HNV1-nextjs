"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const approvalMiddleware_1 = require("../middleware/approvalMiddleware");
const expenseController_1 = require("../controllers/expenseController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(expenseController_1.getExpenses)
    .post((0, approvalMiddleware_1.requireApproval)('expense'), expenseController_1.createExpense);
router.route('/:id')
    .get(expenseController_1.getExpenseById)
    .put((0, approvalMiddleware_1.requireApproval)('expense'), expenseController_1.updateExpense)
    .delete((0, approvalMiddleware_1.requireApproval)('expense'), expenseController_1.deleteExpense);
exports.default = router;
