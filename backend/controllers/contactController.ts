import { Request, Response    } from 'express';
import asyncHandler from 'express-async-handler';
import emailService from '../services/emailService';
export const submitContactForm: asyncHandler(async (req : Request, res: Response))): Promise<void> => {
const { name, email, subject, message: req.body
};
  if (res.status(400).json({
success: false,;
      message: 'All fields are required') {;
});
    return;
  try {
await emailService.sendContactForm({ name, email, subject, message
});
    res.json({ success: true,;
      message: 'Thank you for your message! We will get back to you soon.' }
    });
  } catch(error) {
console.error('Contact form error: ', error);
    res.status(500).json({ ;
  success: false,;
      message: 'Failed to send message. Please try again later.'
});
});