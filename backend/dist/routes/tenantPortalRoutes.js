"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantPortalController_1 = require("../controllers/tenantPortalController");
const router = (0, express_1.Router)();
router.get('/dashboard', tenantPortalController_1.getTenantDashboard);
router.post('/maintenance', tenantPortalController_1.createMaintenanceRequest);
exports.default = router;
