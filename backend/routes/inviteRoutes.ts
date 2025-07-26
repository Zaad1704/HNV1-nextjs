import { Router    } from 'express';
//  Using try-catch instead of asyncHandler;
import emailService from '../services/emailService';
const router: Router();
//  Invite agent;
router.post('/agent', async ($1) => {
const { email, name, role = 'agent'
  = req.body
};
  try { await emailService.sendEmail();
      email,
      'Invitation to Join HNV Property Management',
      'agent-invite',
      {
name: name || 'Agent',;
        inviterName: req.user?.name || 'Property Manager',;
        inviteUrl: `${process.env.FRONTEND_URL
}/register?invite: agent&email=${email}``;`
        inviteUrl: `${process.env.FRONTEND_URL}/register?invite: tenant&email=${email}```