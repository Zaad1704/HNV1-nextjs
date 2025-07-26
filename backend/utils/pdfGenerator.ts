import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generateReceiptPDF = async (paymentData: any) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText('PAYMENT RECEIPT', {
    x: 200,
    y: 750,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Receipt details
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
      color: rgb(0, 0, 0)
    });
    yPosition -= 30;
  });

  return await pdfDoc.save();
};

export const generatePropertyReportPDF = async (propertyData: any) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText('PROPERTY REPORT', {
    x: 200,
    y: 750,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  // Property details
  const details = [
    `Property: ${propertyData.name}`,
    `Address: ${propertyData.address.street}, ${propertyData.address.city}`,
    `Type: ${propertyData.type}`,
    `Total Units: ${propertyData.units.length}`,
    `Occupied Units: ${propertyData.units.filter((u: any) => u.status === 'occupied').length}`,
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
      color: rgb(0, 0, 0)
    });
    yPosition -= 30;
  });

  return await pdfDoc.save();
};