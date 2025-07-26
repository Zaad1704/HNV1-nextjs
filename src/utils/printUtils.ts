import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Utility functions for PDF generation and printing
 */

/**
 * Generate a PDF from a DOM element
 * @param element The DOM element to convert to PDF
 * @param filename The filename for the PDF
 */
export const generatePDF = async (element: HTMLElement, filename: string = 'document.pdf'): Promise<void> => {
  try {
    // Add print-specific styling
    document.body.classList.add('generating-pdf');
    
    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    // Calculate PDF dimensions (A4 format)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    let pageData = canvas.toDataURL('image/png', 1.0);
    
    // Add image to PDF (first page)
    pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(pageData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(filename);
    
    // Remove print-specific styling
    document.body.classList.remove('generating-pdf');
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.classList.remove('generating-pdf');
    return Promise.reject(error);
  }
};

/**
 * Print a DOM element
 * @param element The DOM element to print
 */
export const printElement = (element: HTMLElement): void => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print this document');
      return;
    }
    
    // Get styles from the current document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Skip external stylesheets that might cause CORS issues
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');
    
    // Create print document HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-hidden {
                display: none !important;
              }
            }
            ${styles}
          </style>
        </head>
        <body class="print-mode">
          ${element.outerHTML}
        </body>
      </html>
    `);
    
    // Wait for content to load before printing
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } catch (error) {
    console.error('Error printing element:', error);
    alert('An error occurred while trying to print. Please try again.');
  }
};

/**
 * Generate a themed PDF with custom styling
 * @param element The DOM element to convert to PDF
 * @param filename The filename for the PDF
 * @param theme Optional theme settings
 */
export const generateThemedPDF = async (
  element: HTMLElement, 
  filename: string = 'document.pdf',
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    headerText?: string;
    footerText?: string;
    logo?: string;
  } = {}
): Promise<void> => {
  try {
    // Create a clone of the element to avoid modifying the original
    const container = document.createElement('div');
    container.innerHTML = element.outerHTML;
    container.className = 'themed-pdf-container';
    
    // Apply theme styling
    const style = document.createElement('style');
    style.textContent = `
      .themed-pdf-container {
        background-color: white;
        padding: 20mm;
        box-sizing: border-box;
      }
      .themed-pdf-header {
        background: linear-gradient(to right, ${theme.primaryColor || '#3b82f6'}, ${theme.secondaryColor || '#10b981'});
        color: white;
        padding: 10mm;
        border-radius: 5mm;
        margin-bottom: 10mm;
      }
      .themed-pdf-footer {
        margin-top: 10mm;
        border-top: 1px solid #e5e7eb;
        padding-top: 5mm;
        font-size: 8pt;
        color: #6b7280;
        text-align: center;
      }
    `;
    
    // Add header
    const header = document.createElement('div');
    header.className = 'themed-pdf-header';
    header.innerHTML = `
      <h1 style="margin: 0; font-size: 16pt;">${theme.headerText || 'Document'}</h1>
      ${theme.logo ? `<img src="${theme.logo}" style="max-height: 15mm; margin-top: 5mm;" />` : ''}
    `;
    
    // Add footer
    const footer = document.createElement('div');
    footer.className = 'themed-pdf-footer';
    footer.textContent = theme.footerText || `Generated on ${new Date().toLocaleDateString()}`;
    
    // Assemble the document
    document.body.appendChild(style);
    document.body.appendChild(container);
    container.insertBefore(header, container.firstChild);
    container.appendChild(footer);
    
    // Generate PDF
    await generatePDF(container, filename);
    
    // Clean up
    document.body.removeChild(container);
    document.body.removeChild(style);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating themed PDF:', error);
    return Promise.reject(error);
  }
};