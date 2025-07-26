"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const statementController_1 = require("../controllers/statementController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/tenant/:tenantId', statementController_1.generateTenantStatement);
exports.default = router;
