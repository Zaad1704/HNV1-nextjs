import PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import { getTranslation } from './pdfTranslations';

/**
 * Generates a comprehensive tenant details PDF
 * @param tenant The tenant object with all details
 * @param stream The writable output stream to pipe the PDF to
 * @param language The language for translations
 */
export const generateTenantDetailsPdf = (tenant: any, stream: Writable, language: string = 'en') => {
  const doc = new PDFDocument({ 
    margin: 40,
    size: 'A4',
    info: {
      Title: `Tenant Details - ${tenant.name}`,
      Author: 'HNV Property Management',
      Subject: 'Tenant Details Report',
      Keywords: 'tenant, details, lease, payments, personal'
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
  headerGradient.stop(0, '#8b5cf6').stop(1, '#a78bfa');
  doc.roundedRect(50, 50, 512, 70, 10).fill(headerGradient);
  
  // Tenant name and title
  doc.fontSize(24).font('Helvetica-Bold').fillColor('white');
  doc.text(tenant.name || 'Tenant Details', 70, 65, { width: 472, align: 'center' });
  doc.fontSize(16).text('TENANT DETAILS REPORT', 70, 95, { width: 472, align: 'center' });
  
  // Basic Information section
  doc.roundedRect(50, 140, 512, 120, 8).fill('#ffffff').strokeColor('#c4b5fd').lineWidth(2).stroke();
  doc.rect(50, 140, 512, 25).fill('#c4b5fd');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#5b21b6');
  doc.text('Basic Information', 70, 147);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Full Name: ${tenant.name || 'N/A'}`, 70, 180);
  doc.text(`Email: ${tenant.email || 'N/A'}`, 70, 200);
  doc.text(`Phone: ${tenant.phone || 'N/A'}`, 70, 220);
  doc.text(`Status: ${tenant.status || 'N/A'}`, 300, 180);
  doc.text(`WhatsApp: ${tenant.whatsappNumber || 'N/A'}`, 300, 200);
  doc.text(`Occupants: ${tenant.numberOfOccupants || 'N/A'}`, 300, 220);
  doc.text(`Created: ${tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A'}`, 70, 240);
  
  // Property & Lease Information
  doc.roundedRect(50, 280, 512, 120, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
  doc.rect(50, 280, 512, 25).fill('#93c5fd');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('Property & Lease Information', 70, 287);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`, 70, 320);
  doc.text(`Unit: ${tenant.unit || 'N/A'}`, 70, 340);
  doc.text(`Monthly Rent: $${(tenant.rentAmount || 0).toLocaleString()}`, 70, 360);
  doc.text(`Security Deposit: $${(tenant.securityDeposit || 0).toLocaleString()}`, 300, 320);
  
  if (tenant.leaseStartDate) {
    doc.text(`Lease Start: ${new Date(tenant.leaseStartDate).toLocaleDateString()}`, 300, 340);
  }
  if (tenant.leaseEndDate) {
    doc.text(`Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`, 300, 360);
    const daysRemaining = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    doc.text(`Days Remaining: ${daysRemaining > 0 ? daysRemaining : 'Expired'}`, 300, 380);
  }
  
  // Personal Details
  doc.roundedRect(50, 420, 512, 140, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
  doc.rect(50, 420, 512, 25).fill('#86efac');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
  doc.text('Personal Details', 70, 427);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  let personalY = 460;
  
  if (tenant.fatherName) {
    doc.text(`Father's Name: ${tenant.fatherName}`, 70, personalY);
    personalY += 20;
  }
  if (tenant.motherName) {
    doc.text(`Mother's Name: ${tenant.motherName}`, 70, personalY);
    personalY += 20;
  }
  if (tenant.govtIdNumber) {
    doc.text(`Government ID: ${tenant.govtIdNumber}`, 70, personalY);
    personalY += 20;
  }
  if (tenant.occupation) {
    doc.text(`Occupation: ${tenant.occupation}`, 300, 460);
  }
  if (tenant.monthlyIncome) {
    doc.text(`Monthly Income: $${tenant.monthlyIncome.toLocaleString()}`, 300, 480);
  }
  
  // Emergency Contact
  if (tenant.emergencyContact?.name) {
    doc.text(`Emergency Contact: ${tenant.emergencyContact.name}`, 300, 500);
    if (tenant.emergencyContact.phone) {
      doc.text(`Emergency Phone: ${tenant.emergencyContact.phone}`, 300, 520);
    }
    if (tenant.emergencyContact.relation) {
      doc.text(`Relation: ${tenant.emergencyContact.relation}`, 300, 540);
    }
  }
  
  // Add new page for addresses and additional information
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
  
  // Address Information
  doc.roundedRect(50, 50, 512, 180, 8).fill('#ffffff').strokeColor('#fdba74').lineWidth(2).stroke();
  doc.rect(50, 50, 512, 25).fill('#fdba74');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#9a3412');
  doc.text('Address Information', 70, 57);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  let addressY = 90;
  
  if (tenant.presentAddress) {
    doc.text('Present Address:', 70, addressY);
    doc.text(tenant.presentAddress, 70, addressY + 15, { width: 200 });
    addressY += 50;
  }
  
  if (tenant.permanentAddress) {
    doc.text('Permanent Address:', 70, addressY);
    doc.text(tenant.permanentAddress, 70, addressY + 15, { width: 200 });
  }
  
  if (tenant.previousAddress) {
    doc.text('Previous Address:', 320, 90);
    doc.text(tenant.previousAddress, 320, 105, { width: 200 });
  }
  
  if (tenant.reasonForMoving) {
    doc.text('Reason for Moving:', 320, 140);
    doc.text(tenant.reasonForMoving, 320, 155, { width: 200 });
  }
  
  // Additional Adults
  if (tenant.additionalAdults && tenant.additionalAdults.length > 0) {
    doc.roundedRect(50, 250, 512, 200, 8).fill('#ffffff').strokeColor('#fca5a5').lineWidth(2).stroke();
    doc.rect(50, 250, 512, 25).fill('#fca5a5');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#991b1b');
    doc.text(`Additional Adults (${tenant.additionalAdults.length})`, 70, 257);
    
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    let adultY = 290;
    
    tenant.additionalAdults.forEach((adult: any, index: number) => {
      if (adultY > 420) {
        doc.addPage();
        doc.rect(0, 0, 612, 792).fill(gradient);
        doc.save();
        doc.rotate(-45, { origin: [306, 396] });
        doc.opacity(0.08);
        doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text('HNV', 0, 396, { align: 'center', width: 612 });
        doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
        doc.restore();
        
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#991b1b');
        doc.text('Additional Adults (Continued)', 70, 50);
        adultY = 80;
      }
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155');
      doc.text(`Adult ${index + 1}:`, 70, adultY);
      
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      if (adult.name) doc.text(`Name: ${adult.name}`, 70, adultY + 15);
      if (adult.phone) doc.text(`Phone: ${adult.phone}`, 70, adultY + 30);
      if (adult.relation) doc.text(`Relation: ${adult.relation}`, 70, adultY + 45);
      if (adult.govtIdNumber) doc.text(`ID: ${adult.govtIdNumber}`, 300, adultY + 15);
      if (adult.fatherName) doc.text(`Father: ${adult.fatherName}`, 300, adultY + 30);
      if (adult.motherName) doc.text(`Mother: ${adult.motherName}`, 300, adultY + 45);
      
      if (adult.permanentAddress) {
        doc.text('Address:', 70, adultY + 60);
        doc.text(adult.permanentAddress, 70, adultY + 75, { width: 400 });
        adultY += 100;
      } else {
        adultY += 70;
      }
    });
  }
  
  // Payment History (if available)
  if (tenant.payments && tenant.payments.length > 0) {
    const paymentsY = tenant.additionalAdults && tenant.additionalAdults.length > 0 ? 470 : 250;
    
    if (paymentsY > 600) {
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
    
    doc.roundedRect(50, paymentsY, 512, 200, 8).fill('#ffffff').strokeColor('#86efac').lineWidth(2).stroke();
    doc.rect(50, paymentsY, 512, 25).fill('#86efac');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#166534');
    doc.text('Recent Payment History', 70, paymentsY + 7);
    
    // Payment headers
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
    doc.text('Date', 70, paymentsY + 40);
    doc.text('Amount', 150, paymentsY + 40);
    doc.text('Method', 250, paymentsY + 40);
    doc.text('Status', 350, paymentsY + 40);
    doc.text('Month', 450, paymentsY + 40);
    
    // Payment rows
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    let paymentY = paymentsY + 60;
    
    tenant.payments.slice(0, 8).forEach((payment: any, index: number) => {
      if (index % 2 === 0) {
        doc.rect(70, paymentY - 5, 472, 18).fill('#f8fafc');
      }
      
      doc.text(new Date(payment.paymentDate).toLocaleDateString(), 70, paymentY);
      doc.text(`$${payment.amount.toFixed(2)}`, 150, paymentY);
      doc.text(payment.paymentMethod || 'N/A', 250, paymentY);
      
      const statusColor = payment.status === 'Paid' || payment.status === 'Completed' ? '#16a34a' : '#ca8a04';
      doc.fillColor(statusColor);
      doc.text(payment.status, 350, paymentY);
      doc.fillColor('#334155');
      
      doc.text(payment.rentMonth || 'N/A', 450, paymentY);
      
      paymentY += 18;
    });
    
    // Payment summary
    const totalPaid = tenant.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#166534');
    doc.text(`Total Payments: ${tenant.payments.length}`, 70, paymentY + 10);
    doc.text(`Total Amount: $${totalPaid.toLocaleString()}`, 250, paymentY + 10);
  }
  
  // Additional Information
  if (tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions) {
    doc.addPage();
    doc.rect(0, 0, 612, 792).fill(gradient);
    doc.save();
    doc.rotate(-45, { origin: [306, 396] });
    doc.opacity(0.08);
    doc.fontSize(80).font('Helvetica-Bold').fillColor('#2563eb');
    doc.text('HNV', 0, 396, { align: 'center', width: 612 });
    doc.fontSize(20).text('Property Management', 0, 480, { align: 'center', width: 612 });
    doc.restore();
    
    doc.roundedRect(50, 50, 512, 200, 8).fill('#ffffff').strokeColor('#93c5fd').lineWidth(2).stroke();
    doc.rect(50, 50, 512, 25).fill('#93c5fd');
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Additional Information', 70, 57);
    
    doc.fontSize(10).font('Helvetica').fillColor('#334155');
    let additionalY = 90;
    
    if (tenant.vehicleDetails) {
      doc.text('Vehicle Details:', 70, additionalY);
      doc.text(tenant.vehicleDetails, 70, additionalY + 15, { width: 450 });
      additionalY += 50;
    }
    
    if (tenant.petDetails) {
      doc.text('Pet Details:', 70, additionalY);
      doc.text(tenant.petDetails, 70, additionalY + 15, { width: 450 });
      additionalY += 50;
    }
    
    if (tenant.specialInstructions) {
      doc.text('Special Instructions:', 70, additionalY);
      doc.text(tenant.specialInstructions, 70, additionalY + 15, { width: 450 });
    }
  }
  
  // Footer
  const currentYear = new Date().getFullYear();
  doc.fontSize(8).font('Helvetica').fillColor('#64748b');
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, 750, { align: 'center', width: 512 });
  doc.text(`Powered by HNV Property Management Solutions`, 50, 765, { align: 'center', width: 512 });
  doc.text(`© ${currentYear} All rights reserved - Confidential tenant information`, 50, 780, { align: 'center', width: 512 });
  
  doc.end();
};

/**
 * Generates a comprehensive tenant details PDF with images and better layout
 * @param tenant The tenant object with all details
 * @param stream The writable output stream to pipe the PDF to
 * @param language The language for translations
 */
export const generateComprehensiveTenantPdf = async (tenant: any, stream: Writable, language: string = 'en') => {
  const doc = new PDFDocument({ 
    margin: 40,
    size: 'A4',
    info: {
      Title: `Complete Tenant Package - ${tenant.name}`,
      Author: 'HNV Property Management',
      Subject: 'Complete Tenant Information Package',
      Keywords: 'tenant, complete, details, images, documents'
    }
  });
  
  doc.pipe(stream);
  
  // Professional header with company branding
  const headerGradient = doc.linearGradient(0, 0, 612, 100);
  headerGradient.stop(0, '#1e40af').stop(1, '#3b82f6');
  doc.rect(0, 0, 612, 100).fill(headerGradient);
  
  // Company logo placeholder and title
  doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('HNV', 40, 20, { width: 100 });
  doc.fontSize(12).text('Property Management', 40, 55);
  
  doc.fontSize(28).text('COMPLETE TENANT PACKAGE', 200, 25, { width: 300, align: 'center' });
  doc.fontSize(16).text(tenant.name, 200, 60, { width: 300, align: 'center' });
  
  // Reset position and add tenant photo section
  doc.y = 120;
  doc.fillColor('#000000');
  
  // Tenant identification section with photo
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('TENANT IDENTIFICATION', 40, doc.y, { underline: true });
  doc.moveDown(0.5);
  
  // Photo section
  const photoY = doc.y;
  doc.rect(40, photoY, 120, 150).stroke('#d1d5db').lineWidth(1);
  
  // Try to add tenant photo if available
  if (tenant.tenantImage || tenant.imageUrl) {
    doc.fontSize(10).fillColor('#6b7280');
    doc.text('TENANT PHOTO', 70, photoY + 70, { align: 'center', width: 60 });
    doc.text('(Image Available)', 70, photoY + 85, { align: 'center', width: 60 });
  } else {
    doc.fontSize(10).fillColor('#6b7280');
    doc.text('NO PHOTO', 70, photoY + 70, { align: 'center', width: 60 });
    doc.text('AVAILABLE', 70, photoY + 85, { align: 'center', width: 60 });
  }
  
  // Basic information beside photo
  const infoX = 180;
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('BASIC INFORMATION', infoX, photoY, { underline: true });
  
  doc.fontSize(11).font('Helvetica').fillColor('#334155');
  let infoY = photoY + 25;
  
  const infoItems = [
    ['Full Name:', tenant.name],
    ['Email:', tenant.email],
    ['Phone:', tenant.phone],
    ['WhatsApp:', tenant.whatsappNumber || 'N/A'],
    ['Status:', tenant.status],
    ['Occupants:', tenant.numberOfOccupants || 1]
  ];
  
  infoItems.forEach(([label, value]) => {
    doc.text(label, infoX, infoY, { continued: true, width: 80 });
    doc.font('Helvetica-Bold').text(` ${value}`, { width: 200 });
    doc.font('Helvetica');
    infoY += 18;
  });
  
  doc.y = photoY + 170;
  doc.moveDown();
  
  // Property and lease information
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('PROPERTY & LEASE INFORMATION', { underline: true });
  doc.moveDown(0.5);
  
  // Create a bordered section
  const propSectionY = doc.y;
  doc.roundedRect(40, propSectionY, 532, 100, 8).stroke('#3b82f6').lineWidth(2);
  doc.rect(40, propSectionY, 532, 25).fill('#eff6ff');
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('LEASE DETAILS', 50, propSectionY + 8);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  const leftCol = 50;
  const rightCol = 320;
  let propY = propSectionY + 35;
  
  const propItems = [
    ['Property:', tenant.propertyId?.name || 'N/A'],
    ['Unit Number:', tenant.unit],
    ['Monthly Rent:', `$${(tenant.rentAmount || 0).toLocaleString()}`],
    ['Security Deposit:', `$${(tenant.securityDeposit || 0).toLocaleString()}`]
  ];
  
  propItems.forEach(([label, value], index) => {
    const x = index % 2 === 0 ? leftCol : rightCol;
    const y = propY + Math.floor(index / 2) * 18;
    doc.text(label, x, y, { continued: true });
    doc.font('Helvetica-Bold').text(` ${value}`);
    doc.font('Helvetica');
  });
  
  if (tenant.leaseStartDate) {
    doc.text('Lease Start:', leftCol, propY + 36, { continued: true });
    doc.font('Helvetica-Bold').text(` ${new Date(tenant.leaseStartDate).toLocaleDateString()}`);
    doc.font('Helvetica');
  }
  
  if (tenant.leaseEndDate) {
    const daysRemaining = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    doc.text('Lease End:', rightCol, propY + 36, { continued: true });
    doc.font('Helvetica-Bold').text(` ${new Date(tenant.leaseEndDate).toLocaleDateString()}`);
    doc.font('Helvetica');
    
    const remainingColor = daysRemaining < 30 ? '#dc2626' : daysRemaining < 90 ? '#f59e0b' : '#16a34a';
    doc.text('Days Remaining:', leftCol, propY + 54, { continued: true });
    doc.font('Helvetica-Bold').fillColor(remainingColor).text(` ${daysRemaining > 0 ? daysRemaining : 'Expired'}`);
    doc.fillColor('#334155').font('Helvetica');
  }
  
  doc.y = propSectionY + 120;
  doc.moveDown();
  
  // Payment summary with visual elements
  if (tenant.payments && tenant.payments.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('PAYMENT ANALYSIS', { underline: true });
    doc.moveDown(0.5);
    
    const totalPaid = tenant.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const avgPayment = totalPaid / tenant.payments.length;
    
    // Payment summary cards
    const cardWidth = 125;
    const cardHeight = 80;
    const cardSpacing = 10;
    const startX = 40;
    
    const paymentCards = [
      { title: 'Total Payments', value: tenant.payments.length.toString(), color: '#3b82f6' },
      { title: 'Total Amount', value: `$${totalPaid.toLocaleString()}`, color: '#16a34a' },
      { title: 'Average Payment', value: `$${Math.round(avgPayment).toLocaleString()}`, color: '#8b5cf6' },
      { title: 'Last Payment', value: new Date(tenant.payments[0].paymentDate).toLocaleDateString(), color: '#f59e0b' }
    ];
    
    paymentCards.forEach((card, index) => {
      const x = startX + (cardWidth + cardSpacing) * index;
      const y = doc.y;
      
      doc.roundedRect(x, y, cardWidth, cardHeight, 8).fill('#ffffff').stroke(card.color).lineWidth(2);
      doc.rect(x, y, cardWidth, 25).fill(card.color);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text(card.title, x + 5, y + 8, { width: cardWidth - 10, align: 'center' });
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor(card.color);
      doc.text(card.value, x + 5, y + 40, { width: cardWidth - 10, align: 'center' });
    });
    
    doc.y += cardHeight + 20;
    doc.moveDown();
  }
  
  // Add new page for personal details
  doc.addPage();
  
  // Personal details section
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('PERSONAL DETAILS', 40, 40, { underline: true });
  doc.moveDown(0.5);
  
  // Family information
  if (tenant.fatherName || tenant.motherName || tenant.govtIdNumber) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151');
    doc.text('FAMILY INFORMATION', { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    const familyItems = [
      ['Father\'s Name:', tenant.fatherName],
      ['Mother\'s Name:', tenant.motherName],
      ['Government ID:', tenant.govtIdNumber],
      ['Occupation:', tenant.occupation],
      ['Monthly Income:', tenant.monthlyIncome ? `$${tenant.monthlyIncome.toLocaleString()}` : null]
    ].filter(([, value]) => value);
    
    familyItems.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true, width: 120 });
      doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
      doc.font('Helvetica');
      doc.moveDown(0.3);
    });
    
    doc.moveDown();
  }
  
  // Address information
  if (tenant.presentAddress || tenant.permanentAddress) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151');
    doc.text('ADDRESS INFORMATION', { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    
    if (tenant.presentAddress) {
      doc.text('Present Address:', 50, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text(` ${tenant.presentAddress}`, { width: 450 });
      doc.font('Helvetica').moveDown(0.3);
    }
    
    if (tenant.permanentAddress) {
      doc.text('Permanent Address:', 50, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text(` ${tenant.permanentAddress}`, { width: 450 });
      doc.font('Helvetica').moveDown(0.3);
    }
    
    if (tenant.previousAddress) {
      doc.text('Previous Address:', 50, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text(` ${tenant.previousAddress}`, { width: 450 });
      doc.font('Helvetica').moveDown(0.3);
    }
    
    doc.moveDown();
  }
  
  // Emergency contact
  if (tenant.emergencyContact?.name) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151');
    doc.text('EMERGENCY CONTACT', { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    const emergencyItems = [
      ['Name:', tenant.emergencyContact.name],
      ['Phone:', tenant.emergencyContact.phone],
      ['Relationship:', tenant.emergencyContact.relation]
    ].filter(([, value]) => value);
    
    emergencyItems.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true, width: 100 });
      doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
      doc.font('Helvetica');
      doc.moveDown(0.3);
    });
    
    doc.moveDown();
  }
  
  // Additional adults
  if (tenant.additionalAdults && tenant.additionalAdults.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151');
    doc.text(`ADDITIONAL OCCUPANTS (${tenant.additionalAdults.length})`, { underline: true });
    doc.moveDown(0.3);
    
    tenant.additionalAdults.forEach((adult: any, index: number) => {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6b7280');
      doc.text(`Adult ${index + 1}:`, { underline: true });
      doc.moveDown(0.2);
      
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      const adultItems = [
        ['Name:', adult.name],
        ['Phone:', adult.phone],
        ['Relation:', adult.relation],
        ['Government ID:', adult.govtIdNumber],
        ['Father\'s Name:', adult.fatherName],
        ['Mother\'s Name:', adult.motherName]
      ].filter(([, value]) => value);
      
      adultItems.forEach(([label, value]) => {
        doc.text(label, 60, doc.y, { continued: true, width: 100 });
        doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
        doc.font('Helvetica');
        doc.moveDown(0.2);
      });
      
      if (adult.permanentAddress) {
        doc.text('Address:', 60, doc.y, { continued: true });
        doc.font('Helvetica-Bold').text(` ${adult.permanentAddress}`, { width: 400 });
        doc.font('Helvetica');
      }
      
      doc.moveDown(0.5);
    });
  }
  
  // Document summary section
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151');
  doc.text('DOCUMENT SUMMARY', { underline: true });
  doc.moveDown(0.3);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  const documentItems = [
    ['Tenant Photo:', (tenant.tenantImage || tenant.imageUrl) ? 'Available' : 'Not Available'],
    ['Government ID (Front):', tenant.govtIdFront ? 'Available' : 'Not Available'],
    ['Government ID (Back):', tenant.govtIdBack ? 'Available' : 'Not Available'],
    ['Additional Documents:', tenant.documents ? `${tenant.documents.length} files` : 'None'],
    ['Uploaded Images:', tenant.uploadedImages ? `${tenant.uploadedImages.length} images` : 'None']
  ];
  
  documentItems.forEach(([label, value]) => {
    const color = value.includes('Available') || value.includes('files') || value.includes('images') ? '#16a34a' : '#dc2626';
    doc.text(label, 50, doc.y, { continued: true, width: 150 });
    doc.fillColor(color).font('Helvetica-Bold').text(` ${value}`);
    doc.fillColor('#334155').font('Helvetica');
    doc.moveDown(0.3);
  });
  
  // Footer with security notice
  const footerY = doc.page.height - 100;
  doc.rect(0, footerY, doc.page.width, 100).fill('#1f2937');
  
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('CONFIDENTIAL DOCUMENT', 40, footerY + 15, { align: 'center', width: 532 });
  
  doc.fontSize(9).font('Helvetica').fillColor('#d1d5db');
  doc.text('This document contains sensitive tenant information protected by privacy laws.', 40, footerY + 35, { align: 'center', width: 532 });
  doc.text('Unauthorized access, distribution, or disclosure is strictly prohibited.', 40, footerY + 50, { align: 'center', width: 532 });
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, footerY + 70, { align: 'center', width: 532 });
  doc.text('HNV Property Management Solutions - Professional Tenant Management', 40, footerY + 85, { align: 'center', width: 532 });
  
  doc.end();
};

/**
 * Generates a personal details only PDF
 * @param tenant The tenant object with personal details
 * @param stream The writable output stream to pipe the PDF to
 * @param language The language for translations
 */
export const generatePersonalDetailsPdf = (tenant: any, stream: Writable, language: string = 'en') => {
  try {
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      info: {
        Title: `Personal Details - ${tenant.name || 'Unknown Tenant'}`,
        Author: 'HNV Property Management',
        Subject: 'Personal Details Report',
        Keywords: 'tenant, personal, details, confidential'
      }
    });
    
    // Handle stream errors
    doc.on('error', (error) => {
      console.error('PDF generation error:', error);
      if (!stream.destroyed) {
        stream.destroy(error);
      }
    });
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      doc.end();
    });
    
    doc.pipe(stream);
  
  // Confidential header
  doc.rect(0, 0, 612, 80).fill('#dc2626');
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('CONFIDENTIAL PERSONAL DETAILS', 40, 20, { align: 'center', width: 532 });
  doc.fontSize(14).text('AUTHORIZED PERSONNEL ONLY', 40, 50, { align: 'center', width: 532 });
  
  doc.y = 100;
  doc.fillColor('#000000');
  
  // Tenant name and basic info
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text(tenant.name, { align: 'center' });
  doc.moveDown();
  
  // Personal information sections
  const sections = [
    {
      title: 'BASIC INFORMATION',
      items: [
        ['Full Name:', tenant.name],
        ['Email:', tenant.email],
        ['Phone:', tenant.phone],
        ['WhatsApp:', tenant.whatsappNumber],
        ['Status:', tenant.status],
        ['Occupants:', tenant.numberOfOccupants]
      ]
    },
    {
      title: 'FAMILY DETAILS',
      items: [
        ['Father\'s Name:', tenant.fatherName],
        ['Mother\'s Name:', tenant.motherName],
        ['Government ID:', tenant.govtIdNumber],
        ['Occupation:', tenant.occupation],
        ['Monthly Income:', tenant.monthlyIncome ? `$${tenant.monthlyIncome}` : null]
      ]
    },
    {
      title: 'ADDRESS INFORMATION',
      items: [
        ['Present Address:', tenant.presentAddress],
        ['Permanent Address:', tenant.permanentAddress],
        ['Previous Address:', tenant.previousAddress],
        ['Reason for Moving:', tenant.reasonForMoving]
      ]
    }
  ];
  
  sections.forEach(section => {
    const filteredItems = section.items.filter(([, value]) => value);
    if (filteredItems.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
      doc.text(section.title, { underline: true });
      doc.moveDown(0.3);
      
      doc.fontSize(11).font('Helvetica').fillColor('#334155');
      filteredItems.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 120 });
        doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
        doc.font('Helvetica');
        doc.moveDown(0.3);
      });
      
      doc.moveDown();
    }
  });
  
  // Emergency contact
  if (tenant.emergencyContact?.name) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('EMERGENCY CONTACT', { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    const emergencyItems = [
      ['Name:', tenant.emergencyContact.name],
      ['Phone:', tenant.emergencyContact.phone],
      ['Relationship:', tenant.emergencyContact.relation]
    ].filter(([, value]) => value);
    
    emergencyItems.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true, width: 100 });
      doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
      doc.font('Helvetica');
      doc.moveDown(0.3);
    });
    
    doc.moveDown();
  }
  
  // Additional information
  const additionalItems = [
    ['Vehicle Details:', tenant.vehicleDetails],
    ['Pet Details:', tenant.petDetails],
    ['Special Instructions:', tenant.specialInstructions]
  ].filter(([, value]) => value);
  
  if (additionalItems.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('ADDITIONAL INFORMATION', { underline: true });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    additionalItems.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true, width: 120 });
      doc.font('Helvetica-Bold').text(` ${value}`, { width: 400 });
      doc.font('Helvetica');
      doc.moveDown(0.3);
    });
  }
  
    // Security footer
    const footerY = doc.page.height - 60;
    doc.rect(0, footerY, 612, 60).fill('#fef3c7');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400e');
    doc.text('CONFIDENTIAL - Handle with care and dispose securely', 40, footerY + 15, { align: 'center', width: 532 });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, 40, footerY + 35, { align: 'center', width: 532 });
    
    doc.end();
  } catch (error) {
    console.error('Error generating personal details PDF:', error);
    if (!stream.destroyed) {
      stream.destroy(error);
    }
  }
};

/**
 * Generates a tenant lease agreement PDF
 * @param tenant The tenant object with lease details
 * @param stream The writable output stream to pipe the PDF to
 * @param language The language for translations
 */
export const generateTenantLeaseAgreement = (tenant: any, stream: Writable, language: string = 'en') => {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    info: {
      Title: `Lease Agreement - ${tenant.name}`,
      Author: 'HNV Property Management',
      Subject: 'Lease Agreement',
      Keywords: 'lease, agreement, tenant, property, rental'
    }
  });
  
  doc.pipe(stream);
  
  // Background gradient
  const gradient = doc.linearGradient(0, 0, 612, 792);
  gradient.stop(0, '#f0f8ff').stop(1, '#f5f5f5');
  doc.rect(0, 0, 612, 792).fill(gradient);
  
  // Header
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('RESIDENTIAL LEASE AGREEMENT', 50, 50, { align: 'center', width: 512 });
  
  doc.fontSize(12).font('Helvetica').fillColor('#334155');
  doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`, 50, 100);
  doc.text(`Unit: ${tenant.unit || 'N/A'}`, 50, 120);
  doc.text(`Tenant: ${tenant.name || 'N/A'}`, 50, 140);
  doc.text(`Monthly Rent: $${(tenant.rentAmount || 0).toLocaleString()}`, 50, 160);
  
  if (tenant.leaseStartDate && tenant.leaseEndDate) {
    doc.text(`Lease Period: ${new Date(tenant.leaseStartDate).toLocaleDateString()} to ${new Date(tenant.leaseEndDate).toLocaleDateString()}`, 50, 180);
  }
  
  // Lease terms (basic template)
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('LEASE TERMS AND CONDITIONS', 50, 220);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  const terms = [
    '1. RENT: Tenant agrees to pay monthly rent as specified above.',
    '2. SECURITY DEPOSIT: A security deposit is required as per agreement.',
    '3. OCCUPANCY: Property shall be occupied only by listed tenants.',
    '4. MAINTENANCE: Tenant responsible for minor maintenance and repairs.',
    '5. UTILITIES: Tenant responsible for utilities unless otherwise specified.',
    '6. PETS: Pet policy as per property rules and regulations.',
    '7. TERMINATION: Either party may terminate with proper notice.',
    '8. GOVERNING LAW: This agreement is governed by local rental laws.'
  ];
  
  let termY = 250;
  terms.forEach(term => {
    doc.text(term, 50, termY, { width: 512 });
    termY += 25;
  });
  
  // Signature section
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af');
  doc.text('SIGNATURES', 50, termY + 40);
  
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text('Tenant Signature: _________________________', 50, termY + 70);
  doc.text(`Date: _____________`, 350, termY + 70);
  
  doc.text('Landlord Signature: _________________________', 50, termY + 110);
  doc.text(`Date: _____________`, 350, termY + 110);
  
  // Footer
  const currentYear = new Date().getFullYear();
  doc.fontSize(8).font('Helvetica').fillColor('#64748b');
  doc.text(`Generated by HNV Property Management Solutions - © ${currentYear}`, 50, 750, { align: 'center', width: 512 });
  
  doc.end();
};