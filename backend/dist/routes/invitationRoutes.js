"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invitationController_1 = require("../controllers/invitationController");
const router = (0, express_1.Router)();
router.post('/invite', invitationController_1.inviteTeamMember);
router.get('/org-code', invitationController_1.getOrganizationCode);
router.post('/join', invitationController_1.joinWithCode);
exports.default = router;
