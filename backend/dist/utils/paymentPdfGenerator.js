"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentStatementPdf = exports.generatePaymentReceiptPdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePaymentReceiptPdf = (payment, stream, language = 'en') => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `Payment Receipt - ${payment._id}`,
            Author: 'HNV Property Management',
            Subject: 'Payment Receipt',
            Keywords: 'payment, receipt, tenant, rent'
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
    doc.text('PAID', 0, 396, { align: 'center', width: 612 });
    doc.fontSize(20).text('HNV Property Management', 0, 480, { align: 'center', width: 612 });
    doc.restore();
    const headerGradient = doc.linearGradient(50, 50, 562, 120);
    headerGradient.stop(0, '#16a34a').stop(1, '#22c55e');
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('white');
    doc.text('PAYMENT RECEIPT', 70, 65, { width: 472, align: 'center' });
    doc.fontSize(14).text(`Receipt #: ${payment._id}`, 70, 95, { width: 472, align: 'center' });
    doc.roundedRect(50, 140, 512, 80, 8).fill('#ffffff').strokeColor('#22c55e').lineWidth(3).stroke();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#16a34a');
    doc.text('AMOUNT PAID', 70, 155, { align: 'center', width: 472 });
    doc.fontSize(36).text(`$${payment.amount.toFixed(2)}`, 70, 175, { align: 'center', width: 472 });
    doc.roundedRect(50, 240, 512, 200, 8).fill('#ffffff').strokeColor('#3b82f6').lineWidth(2).stroke();
    doc.rect(50, 240, 512, 30).fill('#3b82f6');
    doc.fontSize(16).font('Helvetica-Bold').fillColor('white');
    doc.text('PAYMENT DETAILS', 70, 250);
    doc.fontSize(12).font('Helvetica').fillColor('#334155');
    let detailY = 285;
    const leftCol = 70;
    const rightCol = 320;
    doc.text('Payment Date:', leftCol, detailY);
    doc.font('Helvetica-Bold').text(new Date(payment.paymentDate).toLocaleDateString(), leftCol + 100, detailY);
    doc.font('Helvetica').text('Payment Method:', rightCol, detailY);
    doc.font('Helvetica-Bold').text(payment.paymentMethod || 'Cash', rightCol + 100, detailY);
    detailY += 25;
    doc.font('Helvetica').text('Status:', leftCol, detailY);
    doc.font('Helvetica-Bold').fillColor('#16a34a').text(payment.status, leftCol + 100, detailY);
    doc.font('Helvetica').fillColor('#334155').text('Transaction ID:', rightCol, detailY);
    doc.font('Helvetica-Bold').text(payment.transactionId || 'N/A', rightCol + 100, detailY);
    detailY += 25;
    if (payment.rentMonth) {
        doc.font('Helvetica').text('Rent Month:', leftCol, detailY);
        doc.font('Helvetica-Bold').text(payment.rentMonth, leftCol + 100, detailY);
    }
    if (payment.description) {
        doc.font('Helvetica').text('Description:', rightCol, detailY);
        doc.font('Helvetica-Bold').text(payment.description.substring(0, 30) + (payment.description.length > 30 ? '...' : ''), rightCol + 100, detailY);
    }
    detailY += 40;
    if (payment.notes) {
        doc.font('Helvetica').text('Notes:', leftCol, detailY);
        doc.font('Helvetica').text(payment.notes, leftCol, detailY + 15, { width: 450 });
    }
    doc.roundedRect(50, 460, 512, 120, 8).fill('#ffffff').strokeColor('#8b5cf6').lineWidth(2).stroke();
    doc.rect(50, 460, 512, 30).fill('#8b5cf6');
    doc.fontSize(16).font('Helvetica-Bold').fillColor('white');
    doc.text('TENANT INFORMATION', 70, 470);
    doc.fontSize(12).font('Helvetica').fillColor('#334155');
    let tenantY = 505;
    if (payment.tenantId) {
        doc.text('Tenant Name:', leftCol, tenantY);
        doc.font('Helvetica-Bold').text(payment.tenantId.name || 'N/A', leftCol + 100, tenantY);
        doc.font('Helvetica').text('Email:', rightCol, tenantY);
        doc.font('Helvetica-Bold').text(payment.tenantId.email || 'N/A', rightCol + 100, tenantY);
        tenantY += 25;
        doc.font('Helvetica').text('Phone:', leftCol, tenantY);
        doc.font('Helvetica-Bold').text(payment.tenantId.phone || 'N/A', leftCol + 100, tenantY);
        if (payment.tenantId.unit) {
            doc.font('Helvetica').text('Unit:', rightCol, tenantY);
            doc.font('Helvetica-Bold').text(payment.tenantId.unit, rightCol + 100, tenantY);
        }
    }
    if (payment.propertyId) {
        doc.roundedRect(50, 600, 512, 80, 8).fill('#ffffff').strokeColor('#f59e0b').lineWidth(2).stroke();
        doc.rect(50, 600, 512, 30).fill('#f59e0b');
        doc.fontSize(16).font('Helvetica-Bold').fillColor('white');
        doc.text('PROPERTY INFORMATION', 70, 610);
        doc.fontSize(12).font('Helvetica').fillColor('#334155');
        let propY = 645;
        doc.text('Property Name:', leftCol, propY);
        doc.font('Helvetica-Bold').text(payment.propertyId.name || 'N/A', leftCol + 120, propY);
        if (payment.propertyId.address) {
            propY += 20;
            doc.font('Helvetica').text('Address:', leftCol, propY);
            doc.font('Helvetica-Bold').text(payment.propertyId.address, leftCol + 120, propY, { width: 350 });
        }
    }
    doc.fontSize(10).fillColor('#6b7280');
    const footerY = 720;
    doc.text('This is an official payment receipt. Please keep for your records.', 50, footerY, { align: 'center', width: 512 });
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, footerY + 15, { align: 'center', width: 512 });
    doc.text('HNV Property Management Solutions - Professional Property Management', 50, footerY + 30, { align: 'center', width: 512 });
    doc.fontSize(8).fillColor('#dc2626');
    doc.text('IMPORTANT: This receipt is valid only if payment has been processed successfully.', 50, footerY + 50, { align: 'center', width: 512 });
    doc.end();
};
exports.generatePaymentReceiptPdf = generatePaymentReceiptPdf;
const generatePaymentStatementPdf = (tenant, payments, stream, language = 'en') => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `Payment Statement - ${tenant.name}`,
            Author: 'HNV Property Management',
            Subject: 'Payment Statement',
            Keywords: 'payment, statement, tenant, history'
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
    headerGradient.stop(0, '#1e40af').stop(1, '#3b82f6');
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
    doc.text('PAYMENT STATEMENT', 70, 65, { width: 472, align: 'center' });
    doc.fontSize(16).text(`${tenant.name}`, 70, 95, { width: 472, align: 'center' });
    doc.roundedRect(50, 140, 512, 100, 8).fill('#ffffff').strokeColor('#3b82f6').lineWidth(2).stroke();
    doc.rect(50, 140, 512, 25).fill('#3b82f6');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('white');
    doc.text('TENANT SUMMARY', 70, 147);
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    const leftCol = 70;
    const rightCol = 320;
    doc.text(`Tenant: ${tenant.name}`, leftCol, 175);
    doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`, rightCol, 175);
    doc.text(`Unit: ${tenant.unit}`, leftCol, 195);
    doc.text(`Monthly Rent: $${tenant.rentAmount || 0}`, rightCol, 195);
    doc.text(`Statement Period: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`, leftCol, 215);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgPayment = payments.length > 0 ? totalPaid / payments.length : 0;
    doc.roundedRect(50, 260, 512, 80, 8).fill('#ffffff').strokeColor('#16a34a').lineWidth(2).stroke();
    doc.rect(50, 260, 512, 25).fill('#16a34a');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('white');
    doc.text('PAYMENT SUMMARY', 70, 267);
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    doc.text(`Total Payments: ${payments.length}`, leftCol, 295);
    doc.text(`Total Amount: $${totalPaid.toFixed(2)}`, rightCol, 295);
    doc.text(`Average Payment: $${avgPayment.toFixed(2)}`, leftCol, 315);
    doc.text(`Last Payment: ${payments.length > 0 ? new Date(payments[0].paymentDate).toLocaleDateString() : 'N/A'}`, rightCol, 315);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('PAYMENT HISTORY', 50, 360);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(50, 380, 512, 20).fill('#374151');
    doc.text('Date', 60, 385);
    doc.text('Amount', 140, 385);
    doc.text('Method', 220, 385);
    doc.text('Status', 300, 385);
    doc.text('Month', 380, 385);
    doc.text('Receipt #', 460, 385);
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    let rowY = 405;
    payments.slice(0, 20).forEach((payment, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, rowY - 3, 512, 18).fill(bgColor);
        doc.text(new Date(payment.paymentDate).toLocaleDateString(), 60, rowY);
        doc.text(`$${payment.amount.toFixed(2)}`, 140, rowY);
        doc.text(payment.paymentMethod || 'Cash', 220, rowY);
        const statusColor = payment.status === 'Paid' ? '#16a34a' : '#dc2626';
        doc.fillColor(statusColor);
        doc.text(payment.status, 300, rowY);
        doc.fillColor('#334155');
        doc.text(payment.rentMonth || 'N/A', 380, rowY);
        doc.text(payment._id.toString().substring(0, 8) + '...', 460, rowY);
        rowY += 18;
        if (rowY > 700) {
            doc.addPage();
            doc.rect(0, 0, 612, 792).fill(gradient);
            doc.save();
            doc.rotate(-45, { origin: [306, 396] });
            doc.opacity(0.08);
            doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
            doc.text('HNV', 0, 396, { align: 'center', width: 612 });
            doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
            doc.restore();
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
            doc.text('PAYMENT HISTORY (Continued)', 50, 50);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
            doc.rect(50, 70, 512, 20).fill('#374151');
            doc.text('Date', 60, 75);
            doc.text('Amount', 140, 75);
            doc.text('Method', 220, 75);
            doc.text('Status', 300, 75);
            doc.text('Month', 380, 75);
            doc.text('Receipt #', 460, 75);
            rowY = 95;
            doc.fontSize(9).font('Helvetica').fillColor('#334155');
        }
    });
    const currentYear = new Date().getFullYear();
    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, 750, { align: 'center', width: 512 });
    doc.text(`Powered by HNV Property Management Solutions`, 50, 765, { align: 'center', width: 512 });
    doc.text(`© ${currentYear} All rights reserved - Confidential payment information`, 50, 780, { align: 'center', width: 512 });
    doc.end();
};
exports.generatePaymentStatementPdf = generatePaymentStatementPdf;
