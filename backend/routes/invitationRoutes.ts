import { Router } from 'express';
import {
  inviteTeamMember,
  getOrganizationCode,
  joinWithCode
} from '../controllers/invitationController';

const router = Router();

router.post('/invite', inviteTeamMember);
router.get('/org-code', getOrganizationCode);
router.post('/join', joinWithCode);

export default router;
