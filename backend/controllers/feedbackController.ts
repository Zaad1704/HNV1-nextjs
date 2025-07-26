import { Request, Response    } from 'express';
import emailService from '../services/emailService';
export const handleFeedbackSubmission: async ($1) => {
const { name, email, subject, message: req.body
};
    if (res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' ) {
});
        return;
    const recipientEmail: 'feedback@hnvpropertysolutions.com';
    const emailSubject: `New Feedback from ${name}: ${subject || 'No Subject'}```