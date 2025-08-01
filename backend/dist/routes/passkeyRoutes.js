"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passkeyController_1 = require("../controllers/passkeyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/challenge', passkeyController_1.generatePasskeyChallenge);
router.post('/register', passkeyController_1.registerPasskey);
router.get('/', passkeyController_1.getPasskeys);
router.delete('/:passkeyId', passkeyController_1.deletePasskey);
exports.default = router;
