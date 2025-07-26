class WhatsAppService {
  // Generate WhatsApp URL for sending messages (free method)
  generateWhatsAppUrl(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  // Generate reminder message
  generateReminderMessage(tenantName: string, amount: number, dueDate: string, organizationName: string): string {
    return `Hi ${tenantName}! 

This is a friendly reminder that your rent payment of $${amount} is due on ${dueDate}.

Please make your payment at your earliest convenience.

Thank you!
${organizationName}

Powered by HNV Property Management Solutions`;
  }

  // Generate invoice message
  generateInvoiceMessage(tenantName: string, invoiceNumber: string, amount: number, organizationName: string): string {
    return `Hi ${tenantName}!

Your invoice #${invoiceNumber} is ready.
Amount: $${amount}

You can view and download your invoice from your tenant portal.

Thank you!
${organizationName}

Powered by HNV Property Management Solutions`;
  }

  // Generate payment confirmation message
  generatePaymentConfirmation(tenantName: string, amount: number, receiptNumber: string, organizationName: string): string {
    return `Hi ${tenantName}!

Thank you for your payment of $${amount}.
Receipt #: ${receiptNumber}

Your payment has been successfully processed.

${organizationName}

Powered by HNV Property Management Solutions`;
  }
}

export default new WhatsAppService();