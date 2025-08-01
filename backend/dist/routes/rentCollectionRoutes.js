"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rentCollectionController_1 = require("../controllers/rentCollectionController");
const router = (0, express_1.Router)();
router.get('/analytics', rentCollectionController_1.getAnalytics);
router.get('/overdue', rentCollectionController_1.getOverdue);
router.get('/period/:year/:month', rentCollectionController_1.getPeriod);
router.post('/period/:year/:month/generate', rentCollectionController_1.generatePeriod);
router.get('/actions', rentCollectionController_1.getActions);
router.post('/action', rentCollectionController_1.createAction);
router.post('/sheet/:id/create', rentCollectionController_1.createSheet);
exports.default = router;
