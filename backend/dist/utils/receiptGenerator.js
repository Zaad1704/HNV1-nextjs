"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnhancedThermalReceipt = exports.generateColorfulPdfReceipt = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateColorfulPdfReceipt = (payment, stream, language = 'en') => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `Payment Receipt - ${payment._id}`,
            Author: 'HNV Property Management',
            Subject: 'Payment Receipt',
            Keywords: 'payment, receipt, rent'
        }
    });
    doc.pipe(stream);
    const gradient = doc.linearGradient(0, 0, 612, 792);
    gradient.stop(0, '#f0f8ff').stop(1, '#f5f5f5');
    doc.rect(0, 0, 612, 792).fill(gradient);
    doc.save();
    doc.rotate(-45, { origin: [306, 396] });
    doc.opacity(0.08);
    doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
    doc.text('HNV', 0, 396, { align: 'center', width: 612 });
    doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
    doc.restore();
    const headerGradient = doc.linearGradient(50, 50, 562, 120);
    headerGradient.stop(0, '#3b82f6').stop(1, '#8b5cf6');
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    const orgName = payment.organizationId?.name || 'Property Management';
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
    doc.text(orgName, 70, 65, { width: 472, align: 'center' });
    doc.fontSize(16).text('PAYMENT RECEIPT', 70, 95, { width: 472, align: 'center' });
    doc.roundedRect(50, 140, 512, 80, 8).fill('#ffffff').strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Receipt Information', 70, 155);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Receipt #: ${payment._id}`, 70, 180);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 70, 200);
    doc.text(`Time: ${new Date(payment.paymentDate).toLocaleTimeString()}`, 300, 200);
    doc.roundedRect(50, 240, 512, 100, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
    doc.rect(50, 240, 512, 25).fill('#93c5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Tenant Information', 70, 247);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Name: ${payment.tenantId?.name || 'N/A'}`, 70, 280);
    doc.text(`Email: ${payment.tenantId?.email || 'N/A'}`, 70, 300);
    doc.text(`Phone: ${payment.tenantId?.phone || 'N/A'}`, 70, 320);
    if (payment.tenantId?.unit) {
        doc.text(`Unit: ${payment.tenantId.unit}`, 300, 280);
    }
    doc.roundedRect(50, 360, 512, 100, 8).fill('#ffffff').strokeColor('#c4b5fd').lineWidth(2).stroke();
    doc.rect(50, 360, 512, 25).fill('#c4b5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#5b21b6');
    doc.text('Property Information', 70, 367);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Property: ${payment.propertyId?.name || 'N/A'}`, 70, 400);
    const address = payment.propertyId?.address?.formattedAddress ||
        payment.propertyId?.address?.street ||
        (payment.propertyId?.address ?
            `${payment.propertyId.address.street || ''}, ${payment.propertyId.address.city || ''}, ${payment.propertyId.address.state || ''} ${payment.propertyId.address.zipCode || ''}`.trim() :
            'N/A');
    doc.text(`Address: ${address}`, 70, 420);
    doc.text(`Unit: ${payment.tenantId?.unit || payment.unit || 'N/A'}`, 70, 440);
    doc.roundedRect(50, 480, 512, 140, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
    doc.rect(50, 480, 512, 25).fill('#86efac');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
    doc.text('Payment Details', 70, 487);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    const description = payment.description || `Payment for ${payment.propertyId?.name || 'Property'}`;
    doc.text(`Description: ${description}`, 70, 520);
    doc.text(`Method: ${payment.paymentMethod || 'N/A'}`, 70, 540);
    doc.text(`Status: ${payment.status.toUpperCase()}`, 70, 560);
    doc.roundedRect(300, 520, 240, 80, 8).fill('#dcfce7').strokeColor('#86efac').lineWidth(1).stroke();
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#166534');
    doc.text('AMOUNT PAID', 320, 535);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#15803d');
    doc.text(`$${payment.amount.toFixed(2)}`, 320, 560);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3b82f6');
    doc.text('Thank you for your payment!', 50, 640, { align: 'center', width: 512 });
    const currentYear = new Date().getFullYear();
    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(`Powered by HNV Property Management Solutions`, 50, 700, { align: 'center', width: 512 });
    doc.text(`© ${currentYear} All rights reserved`, 50, 715, { align: 'center', width: 512 });
    doc.text('This document contains confidential payment information. Please retain for your records.', 50, 730, { align: 'center', width: 512 });
    doc.end();
};
exports.generateColorfulPdfReceipt = generateColorfulPdfReceipt;
const generateEnhancedThermalReceipt = (payment) => {
    const line = '--------------------------------';
    const doubleLine = '********************************';
    const orgName = (payment.organizationId?.name || 'ORGANIZATION').toUpperCase();
    return `
${doubleLine}
       ${orgName}
${doubleLine}

PAYMENT RECEIPT
#${payment._id}
${new Date(payment.paymentDate).toLocaleDateString()} ${new Date(payment.paymentDate).toLocaleTimeString()}

${line}
TENANT: ${payment.tenantId?.name || 'N/A'}
PROPERTY: ${payment.propertyId?.name || 'N/A'}
UNIT: ${payment.unit || 'N/A'}
${line}

PAYMENT DETAILS:
${payment.description || `Payment for ${payment.propertyId?.name || 'Property'}`}
$${payment.amount.toFixed(2)}

${line}
TOTAL: $${payment.amount.toFixed(2)}
METHOD: ${payment.paymentMethod || 'N/A'}
STATUS: ${payment.status.toUpperCase()}
${line}

Thank you for your payment!

Powered by HNV Property
Management Solutions
${doubleLine}
`;
};
exports.generateEnhancedThermalReceipt = generateEnhancedThermalReceipt;
