"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePropertyFinancialSummary = exports.generatePropertyDetailsPdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePropertyDetailsPdf = (property, stream, language = 'en') => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `Property Details - ${property.name}`,
            Author: 'HNV Property Management',
            Subject: 'Property Details Report',
            Keywords: 'property, details, tenants, financial'
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
    headerGradient.stop(0, '#3b82f6').stop(1, '#60a5fa');
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
    doc.text(property.name || 'Property Details', 70, 65, { width: 472, align: 'center' });
    doc.fontSize(16).text('PROPERTY DETAILS REPORT', 70, 95, { width: 472, align: 'center' });
    doc.roundedRect(50, 140, 512, 120, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
    doc.rect(50, 140, 512, 25).fill('#93c5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Property Information', 70, 147);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Name: ${property.name || 'N/A'}`, 70, 180);
    doc.text(`Type: ${property.propertyType || 'N/A'}`, 70, 200);
    doc.text(`Units: ${property.numberOfUnits || 0}`, 300, 180);
    doc.text(`Status: ${property.status || 'N/A'}`, 300, 200);
    const address = property.address?.formattedAddress ||
        property.address?.street ||
        (property.address ?
            `${property.address.street || ''}, ${property.address.city || ''}, ${property.address.state || ''} ${property.address.zipCode || ''}`.trim() :
            'N/A');
    doc.text(`Address: ${address}`, 70, 220);
    doc.text(`Created: ${property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}`, 70, 240);
    doc.roundedRect(50, 280, 512, 100, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
    doc.rect(50, 280, 512, 25).fill('#86efac');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
    doc.text('Financial Summary', 70, 287);
    const totalRent = (property.tenants || []).reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
    const occupiedUnits = (property.tenants || []).filter((t) => t.status === 'Active').length;
    const vacantUnits = (property.numberOfUnits || 0) - occupiedUnits;
    const occupancyRate = property.numberOfUnits ? ((occupiedUnits / property.numberOfUnits) * 100).toFixed(1) : '0';
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Total Monthly Rent: $${totalRent.toLocaleString()}`, 70, 320);
    doc.text(`Occupied Units: ${occupiedUnits}`, 70, 340);
    doc.text(`Vacant Units: ${vacantUnits}`, 300, 320);
    doc.text(`Occupancy Rate: ${occupancyRate}%`, 300, 340);
    doc.text(`Average Rent: $${occupiedUnits ? (totalRent / occupiedUnits).toFixed(2) : '0'}`, 70, 360);
    doc.roundedRect(50, 400, 512, 280, 8).fill('#ffffff').strokeColor('#c4b5fd').lineWidth(2).stroke();
    doc.rect(50, 400, 512, 25).fill('#c4b5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#5b21b6');
    doc.text('Current Tenants', 70, 407);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
    doc.text('Unit', 70, 440);
    doc.text('Tenant Name', 150, 440);
    doc.text('Rent', 300, 440);
    doc.text('Status', 400, 440);
    doc.text('Move-in Date', 470, 440);
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    let yPos = 460;
    if (property.tenants && property.tenants.length > 0) {
        property.tenants.forEach((tenant, index) => {
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
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#5b21b6');
                doc.text('Current Tenants (Continued)', 70, 70);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
                doc.text('Unit', 70, 100);
                doc.text('Tenant Name', 150, 100);
                doc.text('Rent', 300, 100);
                doc.text('Status', 400, 100);
                doc.text('Move-in Date', 470, 100);
                yPos = 120;
            }
            if (index % 2 === 0) {
                doc.rect(70, yPos - 5, 472, 20).fill('#f8fafc');
            }
            doc.fontSize(9).font('Helvetica').fillColor('#334155');
            doc.text(tenant.unit || 'N/A', 70, yPos);
            doc.text(tenant.name || 'N/A', 150, yPos, { width: 140, ellipsis: true });
            doc.text(`$${(tenant.rentAmount || 0).toLocaleString()}`, 300, yPos);
            const statusColor = tenant.status === 'Active' ? '#16a34a' :
                tenant.status === 'Inactive' ? '#dc2626' : '#ca8a04';
            doc.fillColor(statusColor);
            doc.text(tenant.status || 'N/A', 400, yPos);
            doc.fillColor('#334155');
            doc.text(tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A', 470, yPos);
            yPos += 20;
        });
    }
    else {
        doc.text('No tenants found for this property.', 70, yPos);
    }
    if (property.recentPayments && property.recentPayments.length > 0) {
        const paymentsY = Math.min(yPos + 40, 700);
        if (paymentsY > 650) {
            doc.addPage();
            doc.rect(0, 0, 612, 792).fill(gradient);
            doc.save();
            doc.rotate(-45, { origin: [306, 396] });
            doc.opacity(0.08);
            doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
            doc.text('HNV', 0, 396, { align: 'center', width: 612 });
            doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
            doc.restore();
        }
        doc.roundedRect(50, paymentsY, 512, 120, 8).fill('#ffffff').strokeColor('#fdba74').lineWidth(2).stroke();
        doc.rect(50, paymentsY, 512, 25).fill('#fdba74');
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#9a3412');
        doc.text('Recent Payments', 70, paymentsY + 7);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
        doc.text('Date', 70, paymentsY + 40);
        doc.text('Tenant', 150, paymentsY + 40);
        doc.text('Amount', 300, paymentsY + 40);
        doc.text('Status', 400, paymentsY + 40);
        doc.fontSize(9).font('Helvetica').fillColor('#334155');
        let paymentY = paymentsY + 60;
        property.recentPayments.slice(0, 3).forEach((payment, index) => {
            if (index % 2 === 0) {
                doc.rect(70, paymentY - 5, 472, 20).fill('#f8fafc');
            }
            doc.text(new Date(payment.paymentDate).toLocaleDateString(), 70, paymentY);
            doc.text(payment.tenantId?.name || 'N/A', 150, paymentY, { width: 140, ellipsis: true });
            doc.text(`$${payment.amount.toFixed(2)}`, 300, paymentY);
            const paymentStatusColor = payment.status === 'Paid' || payment.status === 'Completed' ? '#16a34a' : '#ca8a04';
            doc.fillColor(paymentStatusColor);
            doc.text(payment.status, 400, paymentY);
            doc.fillColor('#334155');
            paymentY += 20;
        });
    }
    const currentYear = new Date().getFullYear();
    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, 750, { align: 'center', width: 512 });
    doc.text(`Powered by HNV Property Management Solutions`, 50, 765, { align: 'center', width: 512 });
    doc.text(`© ${currentYear} All rights reserved`, 50, 780, { align: 'center', width: 512 });
    doc.end();
};
exports.generatePropertyDetailsPdf = generatePropertyDetailsPdf;
const generatePropertyFinancialSummary = (property, stream, language = 'en') => {
    const doc = new pdfkit_1.default({
        margin: 50,
        size: 'A4',
        info: {
            Title: `Financial Summary - ${property.name}`,
            Author: 'HNV Property Management',
            Subject: 'Property Financial Summary',
            Keywords: 'property, financial, summary, rent, income'
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
    headerGradient.stop(0, '#10b981').stop(1, '#34d399');
    doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
    doc.text(`${property.name} - Financial Summary`, 70, 65, { width: 472, align: 'center' });
    doc.fontSize(16).text('MONTHLY FINANCIAL REPORT', 70, 95, { width: 472, align: 'center' });
    const tenants = property.tenants || [];
    const payments = property.payments || [];
    const expenses = property.expenses || [];
    const totalRent = tenants.reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
    const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const netIncome = totalCollected - totalExpenses;
    const collectionRate = totalRent ? ((totalCollected / totalRent) * 100).toFixed(1) : '0';
    doc.roundedRect(50, 140, 250, 150, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
    doc.rect(50, 140, 250, 25).fill('#86efac');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
    doc.text('Income Summary', 60, 147);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Expected Rent: $${totalRent.toLocaleString()}`, 60, 180);
    doc.text(`Collected: $${totalCollected.toLocaleString()}`, 60, 200);
    doc.text(`Collection Rate: ${collectionRate}%`, 60, 220);
    doc.text(`Outstanding: $${(totalRent - totalCollected).toLocaleString()}`, 60, 240);
    doc.text(`Average per Unit: $${tenants.length ? (totalRent / tenants.length).toFixed(2) : '0'}`, 60, 260);
    doc.roundedRect(312, 140, 250, 150, 8).fill('#ffffff').strokeColor('#fca5a5').lineWidth(2).stroke();
    doc.rect(312, 140, 250, 25).fill('#fca5a5');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#991b1b');
    doc.text('Expense Summary', 322, 147);
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    doc.text(`Total Expenses: $${totalExpenses.toLocaleString()}`, 322, 180);
    doc.text(`Maintenance: $${expenses.filter((e) => e.category === 'maintenance').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`, 322, 200);
    doc.text(`Utilities: $${expenses.filter((e) => e.category === 'utilities').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`, 322, 220);
    doc.text(`Other: $${expenses.filter((e) => !['maintenance', 'utilities'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`, 322, 240);
    doc.roundedRect(50, 310, 512, 80, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
    doc.rect(50, 310, 512, 25).fill('#93c5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Net Income Analysis', 70, 317);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155');
    doc.text(`Net Income: $${netIncome.toLocaleString()}`, 70, 350);
    doc.text(`ROI: ${totalRent ? ((netIncome / totalRent) * 100).toFixed(1) : '0'}%`, 300, 350);
    doc.text(`Profit Margin: ${totalCollected ? ((netIncome / totalCollected) * 100).toFixed(1) : '0'}%`, 450, 350);
    doc.end();
};
exports.generatePropertyFinancialSummary = generatePropertyFinancialSummary;
