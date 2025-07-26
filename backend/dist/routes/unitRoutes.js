"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const unitController_1 = require("../controllers/unitController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.get('/property/:propertyId', unitController_1.getUnits);
router.get('/search', unitController_1.searchUnits);
router.put('/:unitId/nickname', unitController_1.updateUnitNickname);
router.post('/property/:propertyId/bulk', unitController_1.createUnitsForProperty);
router.put('/bulk-nicknames', unitController_1.bulkUpdateUnitNicknames);
router.put('/bulk-update', unitController_1.bulkUpdateUnits);
exports.default = router;
