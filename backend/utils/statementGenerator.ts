import PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import { getTranslation } from './pdfTranslations';

/**
 * Generates a colorful PDF tenant statement
 * @param data The statement data including tenant and payments
 * @param stream The writable output stream to pipe the PDF to
 * @param language The language for translations
 */
export const generateColorfulTenantStatement = (data: any, stream: Writable, language: string = 'en') => {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    info: {
      Title: `Tenant Statement - ${data.tenant.name}`,
      Author: 'HNV Property Management',
      Subject: 'Tenant Statement',
      Keywords: 'tenant, statement, rent, payments'
    }
  });
  
  doc.pipe(stream);
  
  // Background gradient
  const gradient = doc.linearGradient(0, 0, 612, 792);
  gradient.stop(0, '#f0f8ff').stop(1, '#f5f5f5');
  doc.rect(0, 0, 612, 792).fill(gradient);
  
  // Add watermark
  doc.save();
  doc.rotate(-45, { origin: [306, 396] });
  doc.opacity(0.08);
  doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
  doc.text('HNV', 0, 396, { align: 'center', width: 612 });
  doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
  doc.restore();
  
  // Header with gradient background
  const headerGradient = doc.linearGradient(50, 50, 562, 120);
  headerGradient.stop(0, '#3b82f6').stop(1, '#8b5cf6');
  doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
  
  // Organization name and statement title
  const orgName = data.tenant.organizationId?.name || 'Property Management';
  doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
  doc.text(orgName, 70, 65, { width: 472, align: 'center' });
  doc.fontSize(16).text('TENANT STATEMENT', 70, 95, { width: 472, align: 'center' });
  
  // Statement information section
  doc.roundedRect(50, 140, 512, 80, 8).fill('#ffffff').strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('Statement Information', 70, 155);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 70, 180);
  doc.text(`Period: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'All Time'} - ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Present'}`, 70, 200);
  
  // Tenant information section with blue accent
  doc.roundedRect(50, 240, 512, 100, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
  doc.rect(50, 240, 512, 25).fill('#93c5fd');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('Tenant Information', 70, 247);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Name: ${data.tenant.name}`, 70, 280);
  doc.text(`Email: ${data.tenant.email || 'N/A'}`, 70, 300);
  doc.text(`Phone: ${data.tenant.phone || 'N/A'}`, 70, 320);
  
  // Property information section with purple accent
  doc.roundedRect(50, 360, 512, 100, 8).fill('#ffffff').strokeColor('#c4b5fd').lineWidth(2).stroke();
  doc.rect(50, 360, 512, 25).fill('#c4b5fd');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#5b21b6');
  doc.text('Property Information', 70, 367);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Property: ${data.tenant.propertyId?.name || 'N/A'}`, 70, 400);
  
  const address = data.tenant.propertyId?.address?.formattedAddress || 
                 data.tenant.propertyId?.address?.street || 'N/A';
  doc.text(`Address: ${address}`, 70, 420);
  doc.text(`Unit: ${data.tenant.unit || 'N/A'}`, 70, 440);
  
  // Payment history section with green accent
  doc.roundedRect(50, 480, 512, 180, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
  doc.rect(50, 480, 512, 25).fill('#86efac');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
  doc.text('Payment History', 70, 487);
  
  // Payment table headers
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
  doc.text('Date', 70, 520);
  doc.text('Amount', 200, 520);
  doc.text('Method', 300, 520);
  doc.text('Status', 400, 520);
  
  // Payment table rows
  doc.fontSize(9).font('Helvetica').fillColor('#334155');
  let yPos = 540;
  
  if (data.payments && data.payments.length > 0) {
    data.payments.forEach((payment: any, index: number) => {
      // Add a new page if we're running out of space
      if (yPos > 650) {
        doc.addPage();
        // Reset background and watermark
        doc.rect(0, 0, 612, 792).fill(gradient);
        doc.save();
        doc.rotate(-45, { origin: [306, 396] });
        doc.opacity(0.08);
        doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text('HNV', 0, 396, { align: 'center', width: 612 });
        doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
        doc.restore();
        
        // Reset table headers
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
        doc.text('Payment History (Continued)', 70, 70);
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
        doc.text('Date', 70, 100);
        doc.text('Amount', 200, 100);
        doc.text('Method', 300, 100);
        doc.text('Status', 400, 100);
        
        yPos = 120;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(70, yPos - 5, 442, 20).fill('#f8fafc');
      }
      
      doc.fontSize(9).font('Helvetica').fillColor('#334155');
      doc.text(new Date(payment.paymentDate).toLocaleDateString(), 70, yPos);
      doc.text(`$${payment.amount.toFixed(2)}`, 200, yPos);
      doc.text(payment.paymentMethod || 'N/A', 300, yPos);
      
      // Status with color
      const statusColor = payment.status.toLowerCase() === 'paid' || payment.status.toLowerCase() === 'completed' 
        ? '#16a34a' : payment.status.toLowerCase() === 'pending' 
        ? '#ca8a04' : '#dc2626';
      
      doc.fillColor(statusColor);
      doc.text(payment.status.toUpperCase(), 400, yPos);
      doc.fillColor('#334155');
      
      yPos += 20;
    });
  } else {
    doc.text('No payment records found.', 70, yPos);
  }
  
  // Summary section with orange accent
  const summaryY = Math.min(yPos + 20, 680);
  doc.roundedRect(50, summaryY, 512, 80, 8).fill('#ffffff').strokeColor('#fdba74').lineWidth(2).stroke();
  doc.rect(50, summaryY, 512, 25).fill('#fdba74');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#9a3412');
  doc.text('Summary', 70, summaryY + 7);
  
  // Summary content
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
  doc.text('Total Payments:', 70, summaryY + 40);
  doc.text('Total Amount Paid:', 70, summaryY + 60);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(data.payments.length.toString(), 200, summaryY + 40);
  doc.text(`$${data.payments.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}`, 200, summaryY + 60);
  
  // Footer
  const currentYear = new Date().getFullYear();
  doc.fontSize(8).font('Helvetica').fillColor('#64748b');
  doc.text(`Powered by HNV Property Management Solutions`, 50, 750, { align: 'center', width: 512 });
  doc.text(`© ${currentYear} All rights reserved`, 50, 765, { align: 'center', width: 512 });
  
  doc.end();
};

/**
 * Generates an enhanced thermal tenant statement
 * @param data The statement data including tenant and payments
 */
export const generateEnhancedThermalStatement = (data: any): string => {
  const line = '--------------------------------';
  const doubleLine = '********************************';
  const orgName = (data.tenant.organizationId?.name || 'ORGANIZATION').toUpperCase();
  
  let statement = `
${doubleLine}
       ${orgName}
${doubleLine}

TENANT STATEMENT
Generated: ${new Date().toLocaleDateString()}
Period: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'All Time'} - ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Present'}

${line}
TENANT: ${data.tenant.name}
EMAIL: ${data.tenant.email || 'N/A'}
PHONE: ${data.tenant.phone || 'N/A'}
${line}

PROPERTY: ${data.tenant.propertyId?.name || 'N/A'}
UNIT: ${data.tenant.unit || 'N/A'}
RENT: $${data.tenant.rentAmount?.toFixed(2) || '0.00'}
${line}

PAYMENT HISTORY:
`;

  if (data.payments && data.payments.length > 0) {
    data.payments.forEach((payment: any) => {
      statement += `
${new Date(payment.paymentDate).toLocaleDateString()}
$${payment.amount.toFixed(2)} - ${payment.status.toUpperCase()}
${payment.paymentMethod ? `Method: ${payment.paymentMethod}` : ''}
`;
    });
  } else {
    statement += 'No payment records found.\n';
  }

  statement += `
${line}
SUMMARY:
Total Payments: ${data.payments.length}
Total Amount Paid: $${data.payments.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}
${line}

Thank you for your business!

Powered by HNV Property
Management Solutions
${doubleLine}
`;

  return statement;
};