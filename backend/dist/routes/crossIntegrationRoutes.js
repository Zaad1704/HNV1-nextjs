"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crossIntegrationController_1 = require("../controllers/crossIntegrationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/unit/:unitId/history', crossIntegrationController_1.getUnitHistory);
router.get('/tenant/:tenantId/movements', crossIntegrationController_1.getTenantMovementHistory);
router.get('/tenant/:tenantId/journey', crossIntegrationController_1.getTenantJourney);
router.get('/property/:propertyId/analytics', crossIntegrationController_1.getPropertyCrossAnalytics);
router.post('/tenant/transfer', crossIntegrationController_1.processTenantTransfer);
exports.default = router;
