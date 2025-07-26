"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateColorfulPdfExport = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const generateColorfulPdfExport = async (data, request, filePath) => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `${request.type.toUpperCase()} Export`,
            Author: 'HNV Property Management',
            Subject: `${request.type} Export`,
            Keywords: request.type
        }
    });
    const stream = fs_1.default.createWriteStream(filePath);
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
    let headerGradient;
    switch (request.type) {
        case 'properties':
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#3b82f6').stop(1, '#60a5fa');
            break;
        case 'tenants':
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#8b5cf6').stop(1, '#a78bfa');
            break;
        case 'payments':
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#10b981').stop(1, '#34d399');
            break;
        case 'maintenance':
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#f59e0b').stop(1, '#fbbf24');
            break;
        case 'expenses':
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#ef4444').stop(1, '#f87171');
            break;
        default:
            headerGradient = doc.linearGradient(50, 50, 562, 120);
            headerGradient.stop(0, '#3b82f6').stop(1, '#8b5cf6');
    }
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
    doc.text(`${request.type.toUpperCase()} EXPORT`, 70, 65, { width: 472, align: 'center' });
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 70, 95, { width: 472, align: 'center' });
    doc.roundedRect(50, 140, 512, 60, 8).fill('#ffffff').strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Export Information', 70, 155);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Records: ${data.length}`, 70, 180);
    doc.text(`Format: PDF`, 300, 180);
    let accentColor, accentBgColor;
    switch (request.type) {
        case 'properties':
            accentColor = '#1e40af';
            accentBgColor = '#93c5fd';
            break;
        case 'tenants':
            accentColor = '#5b21b6';
            accentBgColor = '#c4b5fd';
            break;
        case 'payments':
            accentColor = '#166534';
            accentBgColor = '#86efac';
            break;
        case 'maintenance':
            accentColor = '#92400e';
            accentBgColor = '#fcd34d';
            break;
        case 'expenses':
            accentColor = '#991b1b';
            accentBgColor = '#fca5a5';
            break;
        default:
            accentColor = '#1e40af';
            accentBgColor = '#93c5fd';
    }
    doc.roundedRect(50, 220, 512, 480, 8).fill('#ffffff').strokeColor(accentBgColor).lineWidth(2).stroke();
    doc.rect(50, 220, 512, 25).fill(accentBgColor);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(accentColor);
    doc.text('Data Records', 70, 227);
    const fields = getExportFields(request.type);
    const headers = fields.map(field => {
        const parts = field.split('.');
        return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
    });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
    const columnWidth = 472 / headers.length;
    headers.forEach((header, index) => {
        doc.text(header, 70 + (index * columnWidth), 260);
    });
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    let yPos = 280;
    let pageCount = 1;
    data.forEach((item, index) => {
        if (yPos > 650) {
            doc.addPage();
            doc.rect(0, 0, 612, 792).fill(gradient);
            doc.save();
            doc.rotate(-45, { origin: [306, 396] });
            doc.opacity(0.08);
            doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
            doc.text('HNV', 0, 396, { align: 'center', width: 612 });
            doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
            doc.restore();
            doc.fontSize(14).font('Helvetica-Bold').fillColor(accentColor);
            doc.text(`${request.type.toUpperCase()} EXPORT (Page ${++pageCount})`, 70, 50);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
            headers.forEach((header, index) => {
                doc.text(header, 70 + (index * columnWidth), 80);
            });
            yPos = 100;
        }
        if (index % 2 === 0) {
            doc.rect(70, yPos - 5, 472, 20).fill('#f8fafc');
        }
        doc.fontSize(9).font('Helvetica').fillColor('#334155');
        fields.forEach((field, fieldIndex) => {
            const parts = field.split('.');
            let value = item;
            for (const part of parts) {
                if (value && typeof value === 'object') {
                    value = value[part];
                }
                else {
                    value = undefined;
                    break;
                }
            }
            let displayValue = 'N/A';
            if (value !== undefined && value !== null) {
                if (field.includes('date') && value instanceof Date) {
                    displayValue = value.toLocaleDateString();
                }
                else if (field.includes('amount') || field.includes('rent') || field.includes('price')) {
                    displayValue = `$${Number(value).toFixed(2)}`;
                }
                else {
                    displayValue = String(value);
                }
            }
            doc.text(displayValue, 70 + (fieldIndex * columnWidth), yPos, {
                width: columnWidth - 10,
                ellipsis: true
            });
        });
        yPos += 20;
    });
    const currentYear = new Date().getFullYear();
    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(`Powered by HNV Property Management Solutions`, 50, 750, { align: 'center', width: 512 });
    doc.text(`© ${currentYear} All rights reserved`, 50, 765, { align: 'center', width: 512 });
    doc.end();
    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};
exports.generateColorfulPdfExport = generateColorfulPdfExport;
function getExportFields(type) {
    switch (type) {
        case 'properties':
            return ['name', 'address.street', 'address.city', 'address.state', 'numberOfUnits', 'monthlyRent'];
        case 'tenants':
            return ['name', 'email', 'phone', 'propertyId.name', 'rentAmount', 'leaseStartDate', 'leaseEndDate'];
        case 'payments':
            return ['tenantId.name', 'propertyId.name', 'amount', 'paymentDate', 'status', 'paymentMethod'];
        case 'maintenance':
            return ['title', 'description', 'status', 'priority', 'propertyId.name', 'tenantId.name', 'createdAt'];
        case 'expenses':
            return ['description', 'amount', 'category', 'date', 'propertyId.name'];
        default:
            return [];
    }
}
