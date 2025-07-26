// Multi-platform messaging helper functions
export const openWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
};

export const openTelegram = (username: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://t.me/${username}?text=${encodedMessage}`;
  window.open(url, '_blank');
};

export const openSMS = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `sms:${cleanPhone}?body=${encodedMessage}`;
  window.open(url, '_self');
};

export const openEmail = (email: string, subject: string, message: string) => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedMessage = encodeURIComponent(message);
  const url = `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`;
  window.open(url, '_self');
};

export const openViber = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `viber://chat?number=${cleanPhone}&text=${encodedMessage}`;
  window.open(url, '_self');
};

export const openSkype = (skypeId: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const url = `skype:${skypeId}?chat&topic=${encodedMessage}`;
  window.open(url, '_self');
};

export const openMessenger = (userId: string) => {
  const url = `https://m.me/${userId}`;
  window.open(url, '_blank');
};

export const openInstagram = (username: string) => {
  const url = `https://ig.me/m/${username}`;
  window.open(url, '_blank');
};

export const openLinkedIn = (profileId: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://www.linkedin.com/messaging/compose/?recipient=${profileId}&message=${encodedMessage}`;
  window.open(url, '_blank');
};

export const messageTemplates = {
  rentReminder: (tenantName: string, amount: number, dueDate: string) =>
    `Hi ${tenantName}, this is a friendly reminder that your rent payment of $${amount} is due on ${dueDate}. Please make your payment at your earliest convenience. Thank you!`,
  
  paymentConfirmation: (tenantName: string, amount: number, date: string) =>
    `Hi ${tenantName}, we have received your rent payment of $${amount} on ${date}. Thank you for your prompt payment!`,
  
  maintenanceUpdate: (tenantName: string, status: string, description: string) =>
    `Hi ${tenantName}, your maintenance request "${description}" has been updated to: ${status}. We'll keep you informed of any further updates.`,
  
  leaseExpiry: (tenantName: string, expiryDate: string) =>
    `Hi ${tenantName}, your lease is set to expire on ${expiryDate}. Please contact us to discuss renewal options. Thank you!`,
  
  teamInvite: (name: string, role: string, companyName: string) =>
    `Hi ${name}, you've been invited to join ${companyName} property management team as ${role}. Please check your email for the invitation link.`,
  
  viewingConfirmation: (tenantName: string, propertyName: string, dateTime: string) =>
    `Hi ${tenantName}, your property viewing for ${propertyName} is confirmed for ${dateTime}. Please arrive on time. Contact us if you need to reschedule.`,
  
  welcomeMessage: (tenantName: string, propertyName: string, unitNumber: string) =>
    `Welcome ${tenantName}! We're excited to have you as our tenant at ${propertyName}, Unit ${unitNumber}. If you have any questions, feel free to reach out!`,
  
  maintenanceRequest: (tenantName: string, description: string) =>
    `Hi ${tenantName}, we've received your maintenance request: "${description}". Our team will address this shortly. Thank you for reporting!`
};