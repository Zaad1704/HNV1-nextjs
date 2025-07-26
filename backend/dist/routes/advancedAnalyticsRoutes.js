"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advancedAnalyticsController_1 = require("../controllers/advancedAnalyticsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.post('/snapshot', advancedAnalyticsController_1.generateAnalyticsSnapshot);
router.get('/dashboard', advancedAnalyticsController_1.getDashboardAnalytics);
router.get('/property-performance', advancedAnalyticsController_1.getPropertyPerformance);
router.get('/trends', advancedAnalyticsController_1.getTrendAnalysis);
router.get('/insights', advancedAnalyticsController_1.getPredictiveInsights);
exports.default = router;
