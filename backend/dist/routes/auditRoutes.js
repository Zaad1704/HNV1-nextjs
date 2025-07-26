"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_1 = require("../controllers/auditController");
const router = (0, express_1.Router)();
router.get('/', auditController_1.getAuditLogs);
router.get('/stats', auditController_1.getAuditStats);
router.post('/', auditController_1.createAuditLog);
exports.default = router;
