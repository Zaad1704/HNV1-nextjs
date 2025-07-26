"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WhatsAppService {
    generateWhatsAppUrl(phone, message) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    }
    generateReminderMessage(tenantName, amount, dueDate, organizationName) {
        return `Hi ${tenantName}! 

This is a friendly reminder that your rent payment of $${amount} is due on ${dueDate}.

Please make your payment at your earliest convenience.

Thank you!
${organizationName}

Powered by HNV Property Management Solutions`;
    }
    generateInvoiceMessage(tenantName, invoiceNumber, amount, organizationName) {
        return `Hi ${tenantName}!

Your invoice #${invoiceNumber} is ready.
Amount: $${amount}

You can view and download your invoice from your tenant portal.

Thank you!
${organizationName}

Powered by HNV Property Management Solutions`;
    }
    generatePaymentConfirmation(tenantName, amount, receiptNumber, organizationName) {
        return `Hi ${tenantName}!

Thank you for your payment of $${amount}.
Receipt #: ${receiptNumber}

Your payment has been successfully processed.

${organizationName}

Powered by HNV Property Management Solutions`;
    }
}
exports.default = new WhatsAppService();
