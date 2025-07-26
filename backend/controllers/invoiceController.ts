import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import { addMonths, startOfMonth, format } from 'date-fns';
import PDFDocument from 'pdfkit';

interface AuthRequest extends Request {
  user?: any;
}

// Create invoice
export const createInvoice = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { tenantId, propertyId, title, category, dueDate, lineItems, notes, priority } = req.body;

    // Validate required fields
    const requiredFields = { tenantId, propertyId, category, dueDate, lineItems };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
      return;
    }

    // Validate line items
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'At least one line item is required' 
      });
      return;
    }

    // Verify tenant and property
    const [tenant, property] = await Promise.all([
      require('../models/Tenant').default.findById(tenantId),
      require('../models/Property').default.findById(propertyId)
    ]);

    if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
      res.status(400).json({ success: false, message: 'Invalid tenant' });
      return;
    }

    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(400).json({ success: false, message: 'Invalid property' });
      return;
    }

    // Generate invoice number
    const count = await Invoice.countDocuments({ organizationId: user.organizationId });
    const invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(4, '0')}`;

    // Calculate amounts
    const processedLineItems = lineItems.map((item: any) => ({
      description: item.description.trim(),
      quantity: parseFloat(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0,
      amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0),
      taxRate: parseFloat(item.taxRate) || 0
    }));

    const subtotal = processedLineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = req.body.taxAmount ? parseFloat(req.body.taxAmount) : 0;
    const discountAmount = req.body.discountAmount ? parseFloat(req.body.discountAmount) : 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoiceData = {
      tenantId,
      propertyId,
      organizationId: user.organizationId,
      invoiceNumber,
      title: title?.trim() || `Invoice for ${tenant.name}`,
      category,
      priority: priority || 'Medium',
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      amount: totalAmount, // Backward compatibility
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      lineItems: processedLineItems,
      notes: notes?.trim() || undefined,
      paymentTerms: req.body.paymentTerms?.trim() || undefined,
      status: 'Draft',
      createdBy: user._id
    };

    const invoice = await Invoice.create(invoiceData);

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('tenantId', 'name email phone unit')
      .populate('propertyId', 'name address')
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({ 
      success: true, 
      data: populatedInvoice,
      message: 'Invoice created successfully'
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search invoices
export const searchInvoices = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
      return;
    }

    let query: any = {
      organizationId: user.organizationId,
      $or: [
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ]
    };

    const invoices = await Invoice.find(query)
      .populate('tenantId', 'name unit')
      .populate('propertyId', 'name address')
      .select('invoiceNumber title totalAmount status category issueDate dueDate tenantId propertyId')
      .sort({ issueDate: -1 })
      .limit(Math.min(50, parseInt(limit as string)))
      .lean();

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error: any) {
    console.error('Search invoices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get invoice summary
export const getInvoiceSummary = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let query: any = { organizationId: user.organizationId };
    
    const [invoices, currentMonth, lastMonth] = await Promise.all([
      Invoice.find(query).lean(),
      Invoice.find({
        ...query,
        issueDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }).lean(),
      Invoice.find({
        ...query,
        issueDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }).lean()
    ]);

    // Calculate statistics
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const overdueInvoices = invoices.filter(i => i.dueDate && new Date() > new Date(i.dueDate) && i.status !== 'Paid');
    
    const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    
    const currentMonthAmount = currentMonth.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const lastMonthAmount = lastMonth.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const monthlyGrowth = lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

    // Status distribution
    const statusDistribution = invoices.reduce((acc: any, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryDistribution = invoices.reduce((acc: any, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalInvoices,
          totalAmount,
          paidAmount,
          overdueAmount,
          pendingAmount: totalAmount - paidAmount,
          collectionRate: totalInvoices > 0 ? Math.round((paidInvoices.length / totalInvoices) * 100) : 0
        },
        monthly: {
          currentMonth: currentMonthAmount,
          lastMonth: lastMonthAmount,
          growth: Math.round(monthlyGrowth * 100) / 100,
          currentMonthCount: currentMonth.length,
          lastMonthCount: lastMonth.length
        },
        distributions: {
          status: statusDistribution,
          category: categoryDistribution
        },
        overdue: {
          count: overdueInvoices.length,
          amount: overdueAmount,
          avgDaysOverdue: overdueInvoices.length > 0 ? 
            Math.round(overdueInvoices.reduce((sum, i) => {
              const days = Math.ceil((new Date().getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / overdueInvoices.length) : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Get invoice summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoice summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk invoice actions
export const bulkInvoiceActions = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { action, invoiceIds, data } = req.body;

    if (!action || !invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid request data' });
      return;
    }

    // Verify all invoices belong to the organization
    const invoices = await Invoice.find({
      _id: { $in: invoiceIds },
      organizationId: user.organizationId
    });

    if (invoices.length !== invoiceIds.length) {
      res.status(403).json({ success: false, message: 'Some invoices not found or not authorized' });
      return;
    }

    let results = [];
    let errors = [];

    switch (action) {
      case 'update_status':
        if (!data || !data.status) {
          res.status(400).json({ success: false, message: 'Status update requires new status' });
          return;
        }
        
        const validStatuses = ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];
        if (!validStatuses.includes(data.status)) {
          res.status(400).json({ success: false, message: 'Invalid status' });
          return;
        }
        
        await Invoice.updateMany(
          { _id: { $in: invoiceIds } },
          { status: data.status }
        );
        results = invoiceIds.map(id => ({ invoiceId: id, newStatus: data.status }));
        break;

      case 'send_invoices':
        await Invoice.updateMany(
          { _id: { $in: invoiceIds } },
          { status: 'Sent', sentAt: new Date() }
        );
        results = invoiceIds.map(id => ({ invoiceId: id, status: 'sent' }));
        break;

      case 'mark_paid':
        await Invoice.updateMany(
          { _id: { $in: invoiceIds } },
          { status: 'Paid', paidAt: new Date() }
        );
        results = invoiceIds.map(id => ({ invoiceId: id, status: 'paid' }));
        break;

      default:
        res.status(400).json({ success: false, message: 'Unknown action' });
        return;
    }

    res.status(200).json({
      success: errors.length === 0,
      data: {
        action,
        processedCount: results.length,
        results,
        errors
      },
      message: `Bulk ${action} completed${errors.length > 0 ? ` with ${errors.length} errors` : ' successfully'}`
    });
  } catch (error: any) {
    console.error('Bulk invoice action error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to perform bulk action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      priority,
      category,
      propertyId, 
      tenantId,
      search, 
      sortBy = 'issueDate', 
      sortOrder = 'desc',
      overdue = 'false',
      startDate,
      endDate
    } = req.query;

    let query: any = { organizationId: user.organizationId };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by property
    if (propertyId) {
      query.propertyId = propertyId;
    }
    
    // Filter by tenant
    if (tenantId) {
      query.tenantId = tenantId;
    }
    
    // Filter overdue invoices
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['Paid', 'Cancelled'] };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) {
        query.issueDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.issueDate.$lte = new Date(endDate as string);
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Agents see only invoices from properties they manage
    if (user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const managedProperties = await Property.find({
        organizationId: user.organizationId,
        managedByAgentId: user._id
      }).select('_id');
      
      const managedPropertyIds = managedProperties.map(p => p._id);
      query.propertyId = { $in: managedPropertyIds };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [invoices, totalCount] = await Promise.all([
      Invoice.find(query)
        .populate('tenantId', 'name email phone unit')
        .populate('propertyId', 'name address')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Invoice.countDocuments(query)
    ]);

    // Calculate summary statistics
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    const overdueAmount = invoices.filter(i => i.dueDate && new Date() > new Date(i.dueDate) && i.status !== 'Paid').reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

    res.status(200).json({ 
      success: true, 
      data: invoices,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      summary: {
        totalInvoices: totalCount,
        totalAmount,
        paidAmount,
        overdueAmount,
        pendingAmount: totalAmount - paidAmount
      }
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const generateInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : addMonths(new Date(), 1);
    const invoiceMonthStart = startOfMonth(targetDate);

    const activeLeases = await Lease.find({
      organizationId: req.user.organizationId,
      status: 'active'
    }).populate('tenantId').populate('propertyId');

    if (activeLeases.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No active leases found to generate invoices for.' 
      });
    }

    const invoicesToCreate = [];
    let countForMonth = await Invoice.countDocuments({
      organizationId: req.user.organizationId,
      createdAt: { $gte: invoiceMonthStart }
    });

    for (const lease of activeLeases) {
      const existingInvoice = await Invoice.findOne({
        leaseId: lease._id,
        dueDate: invoiceMonthStart,
        status: { $in: ['pending', 'overdue'] }
      });

      if (existingInvoice) {
        continue;
      }

      const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${format(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;
      
      invoicesToCreate.push({
        tenantId: (lease.tenantId as any)._id,
        propertyId: (lease.propertyId as any)._id,
        organizationId: req.user.organizationId,
        leaseId: lease._id,
        invoiceNumber,
        amount: lease.rentAmount,
        dueDate: invoiceMonthStart,
        status: 'pending',
        lineItems: [{
          description: `Rent for ${format(invoiceMonthStart, 'MMM yyyy')}`,
          amount: lease.rentAmount
        }]
      });
      countForMonth++;
    }

    if (invoicesToCreate.length > 0) {
      await Invoice.insertMany(invoicesToCreate);
    }

    res.status(201).json({ 
      success: true, 
      message: `${invoicesToCreate.length} new invoices generated successfully for ${format(invoiceMonthStart, 'MMM yyyy')}.`,
      data: { count: invoicesToCreate.length }
    });
  } catch (error) {
    console.error('Generate invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('leaseId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const printInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { format: printFormat = 'standard' } = req.query;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate thermal receipt format (58mm width)
    if (printFormat === 'thermal') {
      const thermalReceipt = generateThermalReceipt(invoice);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}-thermal.txt"`);
      return res.send(thermalReceipt);
    }

    // Generate PDF format
    if (printFormat === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.pipe(res);
      generatePDFInvoice(doc, invoice);
      doc.end();
      return;
    }

    // Standard format
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const generateThermalReceipt = (invoice: any): string => {
  const line = '--------------------------------';
  const doubleLine = '================================';
  
  return `
${doubleLine}
    ${(invoice.organizationId?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

RENT INVOICE
Invoice #: ${invoice.invoiceNumber}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

${line}
TENANT INFORMATION
${line}
Name: ${invoice.tenantId?.name || 'N/A'}
Email: ${invoice.tenantId?.email || 'N/A'}
Phone: ${invoice.tenantId?.phone || 'N/A'}

${line}
PROPERTY INFORMATION
${line}
Property: ${invoice.propertyId?.name || 'N/A'}
Address: ${invoice.propertyId?.address || 'N/A'}

${line}
ITEMS
${line}
${invoice.lineItems?.map((item: any) => 
  `${item.description}\n$${item.amount.toFixed(2)}`
).join('\n\n') || 'No items'}

${line}
TOTAL: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
${line}

Thank you for your payment!

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};

const generatePDFInvoice = (doc: any, invoice: any) => {
  const orgName = invoice.organizationId?.name || 'ORGANIZATION';
  
  // Header with organization name
  doc.fontSize(20).font('Helvetica-Bold').text(orgName.toUpperCase(), 50, 50, { align: 'center' });
  doc.fontSize(16).font('Helvetica').text('RENT INVOICE', 50, 80, { align: 'center' });
  
  // Invoice details
  doc.fontSize(12).font('Helvetica');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 50, 120);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 140);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 160);
  
  // Tenant information
  doc.fontSize(14).font('Helvetica-Bold').text('TENANT INFORMATION', 50, 200);
  doc.fontSize(12).font('Helvetica');
  doc.text(`Name: ${invoice.tenantId?.name || 'N/A'}`, 50, 220);
  doc.text(`Email: ${invoice.tenantId?.email || 'N/A'}`, 50, 240);
  doc.text(`Phone: ${invoice.tenantId?.phone || 'N/A'}`, 50, 260);
  
  // Property information
  doc.fontSize(14).font('Helvetica-Bold').text('PROPERTY INFORMATION', 50, 300);
  doc.fontSize(12).font('Helvetica');
  doc.text(`Property: ${invoice.propertyId?.name || 'N/A'}`, 50, 320);
  doc.text(`Address: ${invoice.propertyId?.address || 'N/A'}`, 50, 340);
  
  // Line items
  doc.fontSize(14).font('Helvetica-Bold').text('ITEMS', 50, 380);
  let yPos = 400;
  
  if (invoice.lineItems && invoice.lineItems.length > 0) {
    invoice.lineItems.forEach((item: any) => {
      doc.fontSize(12).font('Helvetica');
      doc.text(item.description, 50, yPos);
      doc.text(`$${item.amount.toFixed(2)}`, 450, yPos, { align: 'right' });
      yPos += 20;
    });
  } else {
    doc.fontSize(12).font('Helvetica').text('No items', 50, yPos);
    yPos += 20;
  }
  
  // Total
  doc.moveTo(50, yPos + 10).lineTo(550, yPos + 10).stroke();
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('TOTAL:', 50, yPos + 20);
  doc.text(`$${invoice.amount.toFixed(2)}`, 450, yPos + 20, { align: 'right' });
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, yPos + 40);
  
  // Thank you message
  doc.fontSize(12).font('Helvetica').text('Thank you for your payment!', 50, yPos + 80, { align: 'center' });
  
  // Footer with HNV branding
  doc.fontSize(10).font('Helvetica').text('Powered by HNV Property Management Solutions', 50, 750, { align: 'center' });
};

export const bulkDownloadInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { ids, status, dateFrom, dateTo, format = 'thermal' } = req.query;
    let query: any = { organizationId: req.user.organizationId };

    if (ids) {
      query._id = { $in: (ids as string).split(',') };
    }
    if (status) {
      query.status = status;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const invoices = await Invoice.find(query)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (format === 'thermal') {
      const bulkReceipts = invoices.map(invoice => 
        `${generateThermalReceipt(invoice)}\n\n${'='.repeat(50)}\n\n`
      ).join('');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="bulk-invoices-${Date.now()}.txt"`);
      return res.send(bulkReceipts);
    }

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendWhatsAppInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { phone, message } = req.body;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name phone')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipientPhone = phone || (invoice.tenantId as any)?.phone;
    if (!recipientPhone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    const whatsappMessage = message || `Hi ${(invoice.tenantId as any)?.name}, your invoice #${invoice.invoiceNumber} for $${invoice.amount} is ready. Amount due: $${invoice.amount}. Thank you!`;
    
    // WhatsApp Business API URL (free for basic messages)
    const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    res.status(200).json({ 
      success: true, 
      data: { 
        whatsappUrl,
        message: whatsappMessage,
        phone: recipientPhone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendEmailInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, subject, message } = req.body;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name email')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipientEmail = email || (invoice.tenantId as any)?.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Email address required' });
    }

    const emailSubject = subject || `Invoice #${invoice.invoiceNumber} from ${(invoice.organizationId as any)?.name}`;
    const emailMessage = message || `Dear ${(invoice.tenantId as any)?.name},\n\nPlease find your invoice #${invoice.invoiceNumber} for $${invoice.amount}.\n\nThank you!\n\nPowered by HNV Property Management Solutions`;
    
    // Generate PDF attachment
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const pdfBuffer: Buffer[] = [];
    
    doc.on('data', (chunk) => pdfBuffer.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(pdfBuffer);
      
      // Return email data with PDF attachment
      res.status(200).json({ 
        success: true, 
        data: { 
          to: recipientEmail,
          subject: emailSubject,
          message: emailMessage,
          attachment: {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfData.toString('base64'),
            contentType: 'application/pdf'
          },
          textInvoice: generateThermalReceipt(invoice)
        }
      });
    });
    
    generatePDFInvoice(doc, invoice);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};