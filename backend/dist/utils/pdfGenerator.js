"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePropertyReportPDF = exports.generateReceiptPDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const generateReceiptPDF = async (paymentData) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    page.drawText('PAYMENT RECEIPT', {
        x: 200,
        y: 750,
        size: 24,
        font: boldFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    const details = [
        `Receipt Number: ${paymentData.receiptNumber}`,
        `Date: ${new Date(paymentData.paidDate).toLocaleDateString()}`,
        `Tenant: ${paymentData.tenant.firstName} ${paymentData.tenant.lastName}`,
        `Property: ${paymentData.property.name}`,
        `Amount: $${paymentData.amount}`,
        `Payment Method: ${paymentData.method}`,
        `Type: ${paymentData.type}`
    ];
    let yPosition = 650;
    details.forEach(detail => {
        page.drawText(detail, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        yPosition -= 30;
    });
    return await pdfDoc.save();
};
exports.generateReceiptPDF = generateReceiptPDF;
const generatePropertyReportPDF = async (propertyData) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    page.drawText('PROPERTY REPORT', {
        x: 200,
        y: 750,
        size: 24,
        font: boldFont,
        color: (0, pdf_lib_1.rgb)(0, 0, 0)
    });
    const details = [
        `Property: ${propertyData.name}`,
        `Address: ${propertyData.address.street}, ${propertyData.address.city}`,
        `Type: ${propertyData.type}`,
        `Total Units: ${propertyData.units.length}`,
        `Occupied Units: ${propertyData.units.filter((u) => u.status === 'occupied').length}`,
        `Monthly Revenue: $${propertyData.financials.totalRent}`,
        `Occupancy Rate: ${propertyData.analytics.occupancyRate}%`
    ];
    let yPosition = 650;
    details.forEach(detail => {
        page.drawText(detail, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        yPosition -= 30;
    });
    return await pdfDoc.save();
};
exports.generatePropertyReportPDF = generatePropertyReportPDF;
