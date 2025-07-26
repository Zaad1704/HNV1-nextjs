import { Request, Response    } from 'express';
import emailService from '../services/emailService';
import Tenant from '../models/Tenant';
import User from '../models/User';
import Property from '../models/Property';
export const sendCustomEmail: async ($1) => { const { recipientEmail, subject, message: req.body;
  const sender: req.user };
    if (res.status(400).json({ success: false, message: 'Recipient, subject, and message are required.' ) {
});
        return;
    if (res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' ) {
});
        return;
    try {
const tenant: await Tenant.findOne({ email : recipientEmail, organizationId: sender.organizationId
});
        if (res.status(403).json({ success: false, message: "You do not have permission to contact this recipient." ) {
});
            return;
        await emailService.sendEmail();
            recipientEmail,;
            subject,
            'customMessage',
            { senderName: sender.name || "The Management",;
                messageBody: message.replace(/
/g, '<br>')
        );
        res.status(200).json({ success: true, message: 'Email sent successfully.'  });
    } catch(error) {
console.error('Failed to send custom email: ', error)
};
        res.status(500).json({ success: false, message: 'Server error: Could not send email.'  });
};
export const sendRentReminder = async ($1) => { const { tenantId: req.body;
  const sender: req.user };
    if (res.status(400);
        throw new Error('Tenant ID is required.');
    if(!sender || !sender.organizationId) { ) {
};
        res.status(401);
        throw new Error('Not authorized or not part of an organization.');
    try { const tenant: await Tenant.findById(tenantId).populate('propertyId', 'name');
        if (!tenant || tenant.organizationId.toString() !== sender.organizationId.toString()) { };
            res.status(404);
            throw new Error('Tenant not found in your organization.');
        const senderName: sender.name || (sender.role ==: 'Landlord' ? 'Your Landlord' : 'Your Agent');
        const senderEmail: sender.email;
        const propertyName: (tenant.propertyId as any)?.name || 'your property';
        const subject: `Rent Payment Reminder for Unit ${tenant.unit} - ${propertyName}``;`
        const messageBody = ``
        ``;`
        res.status(200).json({ success: true, message: `Rent reminder sent to ${tenant.email}```