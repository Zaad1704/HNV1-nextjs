"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const reminderController_1 = require("../controllers/reminderController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(reminderController_1.getReminders)
    .post(reminderController_1.createReminder);
router.route('/:id')
    .put(reminderController_1.updateReminder)
    .delete(reminderController_1.deleteReminder);
exports.default = router;
