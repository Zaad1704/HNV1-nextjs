"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enhancedBulkPaymentController_1 = require("../controllers/enhancedBulkPaymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.post('/batch', enhancedBulkPaymentController_1.createBulkPaymentBatch);
router.post('/batch/:batchId/process', enhancedBulkPaymentController_1.processBulkPaymentBatch);
router.get('/batches', enhancedBulkPaymentController_1.getBulkPaymentBatches);
router.post('/schedule', enhancedBulkPaymentController_1.createPaymentSchedule);
router.get('/schedules', enhancedBulkPaymentController_1.getPaymentSchedules);
router.post('/process-scheduled', enhancedBulkPaymentController_1.processScheduledPayments);
router.get('/analytics', enhancedBulkPaymentController_1.getPaymentAnalytics);
exports.default = router;
