"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cashFlowController_1 = require("../controllers/cashFlowController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(cashFlowController_1.getCashFlowRecords)
    .post(cashFlowController_1.createCashFlowRecord);
router.route('/:id')
    .put(cashFlowController_1.updateCashFlowRecord)
    .delete(cashFlowController_1.deleteCashFlowRecord);
exports.default = router;
