"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.get('/', healthController_1.healthCheck);
router.get('/dashboard', authMiddleware_1.protect, healthController_1.dashboardHealth);
exports.default = router;
