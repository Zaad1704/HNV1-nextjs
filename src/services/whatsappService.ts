import apiClient from '@/lib/api';

export interface WhatsAppMessage {
  to: string; // Phone number with country code
  message: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

class WhatsAppService {
  // Send text message
  async sendMessage(data: WhatsAppMessage) {
    try {
      const response = await apiClient.post('/whatsapp/send-message', data);
      return response.data;
    } catch (error) {
      console.error('WhatsApp message failed:', error);
      throw error;
    }
  }

  // Send rent reminder
  async sendRentReminder(tenantPhone: string, tenantName: string, amount: number, dueDate: string) {
    return this.sendMessage({
      to: tenantPhone,
      message: `Hi ${tenantName}, this is a friendly reminder that your rent payment of $${amount} is due on ${dueDate}. Please make your payment at your earliest convenience. Thank you!`,
      type: 'text'
    });
  }

  // Send payment confirmation
  async sendPaymentConfirmation(tenantPhone: string, tenantName: string, amount: number, date: string) {
    return this.sendMessage({
      to: tenantPhone,
      message: `Hi ${tenantName}, we have received your rent payment of $${amount} on ${date}. Thank you for your prompt payment!`,
      type: 'text'
    });
  }

  // Send maintenance update
  async sendMaintenanceUpdate(tenantPhone: string, tenantName: string, status: string, description: string) {
    return this.sendMessage({
      to: tenantPhone,
      message: `Hi ${tenantName}, your maintenance request "${description}" has been updated to: ${status}. We'll keep you informed of any further updates.`,
      type: 'text'
    });
  }

  // Send lease expiry notice
  async sendLeaseExpiryNotice(tenantPhone: string, tenantName: string, expiryDate: string) {
    return this.sendMessage({
      to: tenantPhone,
      message: `Hi ${tenantName}, your lease is set to expire on ${expiryDate}. Please contact us to discuss renewal options. Thank you!`,
      type: 'text'
    });
  }

  // Send team invitation
  async sendTeamInvitation(phone: string, name: string, role: string, inviteLink: string) {
    return this.sendMessage({
      to: phone,
      message: `Hi ${name}, you've been invited to join our property management team as ${role}. Click here to accept: ${inviteLink}`,
      type: 'text'
    });
  }

  // Send property viewing appointment
  async sendViewingAppointment(tenantPhone: string, tenantName: string, propertyName: string, dateTime: string) {
    return this.sendMessage({
      to: tenantPhone,
      message: `Hi ${tenantName}, your property viewing for ${propertyName} is scheduled for ${dateTime}. Please arrive on time. Contact us if you need to reschedule.`,
      type: 'text'
    });
  }

  // Send bulk message to multiple tenants
  async sendBulkMessage(phones: string[], message: string) {
    const promises = phones.map(phone => 
      this.sendMessage({ to: phone, message, type: 'text' })
    );
    return Promise.allSettled(promises);
  }
}

export default new WhatsAppService();