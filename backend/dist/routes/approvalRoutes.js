"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const approvalController_1 = require("../controllers/approvalController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.post('/', approvalController_1.createApprovalRequest);
router.get('/', approvalController_1.getApprovalRequests);
router.put('/:id', approvalController_1.updateApprovalStatus);
router.delete('/:id', approvalController_1.deleteApprovalRequest);
exports.default = router;
