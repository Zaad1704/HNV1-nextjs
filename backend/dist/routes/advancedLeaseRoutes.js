"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advancedLeaseController_1 = require("../controllers/advancedLeaseController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/expiring', advancedLeaseController_1.getExpiringLeases);
router.post('/auto-renew', advancedLeaseController_1.processAutoRenewals);
router.post('/bulk-renew', advancedLeaseController_1.bulkRenewLeases);
router.post('/bulk-terminate', advancedLeaseController_1.bulkTerminateLeases);
router.post('/generate-document', advancedLeaseController_1.generateLeaseDocument);
router.put('/:leaseId/auto-renewal', advancedLeaseController_1.updateAutoRenewalSettings);
router.get('/analytics', advancedLeaseController_1.getLeaseAnalytics);
exports.default = router;
