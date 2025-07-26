// backend/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import path from 'path';
import mongoose from 'mongoose';
import { securityHeaders, createRateLimit, sanitizeInput, requestLogger } from './middleware/securityMiddleware';
import { errorHandler } from './middleware/errorHandler';
// Import route files
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import invitationRoutes from './routes/invitationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import expenseRoutes from './routes/expenseRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import cashFlowRoutes from './routes/cashFlowRoutes';
import reminderRoutes from './routes/reminderRoutes';
import editRequestRoutes from './routes/editRequestRoutes';
import userRoutes from './routes/userRoutes';
import billingRoutes from './routes/billingRoutes';
import auditRoutes from './routes/auditRoutes';
import approvalRoutes from './routes/approvalRoutes';
import orgRoutes from './routes/orgRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import setupRoutes from './routes/setupRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import notificationRoutes from './routes/notificationRoutes';
import communicationRoutes from './routes/communicationRoutes';
import sharingRoutes from './routes/sharingRoutes';
import siteSettingsRoutes from './routes/siteSettingsRoutes';
import publicRoutes from './routes/publicRoutes';
import localizationRoutes from './routes/localizationRoutes';
import translationRoutes from './routes/translationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import fileUploadRoutes from './routes/fileUploadRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import receiptRoutes from './routes/receiptRoutes';
import planRoutes from './routes/planRoutes';
import errorRoutes from './routes/errorRoutes';
import contactRoutes from './routes/contactRoutes';
import exportRoutes from './routes/exportRoutes';
import rentCollectionRoutes from './routes/rentCollectionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import integrationRoutes from './routes/integrationRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import tenantPortalRoutes from './routes/tenantPortalRoutes';
import webhookRoutes from './routes/webhookRoutes';
import bulkPaymentRoutes from './routes/bulkPaymentRoutes';
import agentHandoverRoutes from './routes/agentHandoverRoutes';
import reportRoutes from './routes/reportRoutes';
import statementRoutes from './routes/statementRoutes';
import settingsRoutes from './routes/settingsRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import passkeyRoutes from './routes/passkeyRoutes';
import supportRoutes from './routes/supportRoutes';
import testEmailRoutes from './routes/testEmailRoutes';
import propertyVacantUnitsRoutes from './routes/propertyVacantUnitsRoutes';
import rentIncreaseRoutes from './routes/rentIncreaseRoutes';
import unitRoutes from './routes/unitRoutes';
import advancedLeaseRoutes from './routes/advancedLeaseRoutes';
import crossIntegrationRoutes from './routes/crossIntegrationRoutes';
import advancedAnalyticsRoutes from './routes/advancedAnalyticsRoutes';
import enhancedBulkPaymentRoutes from './routes/enhancedBulkPaymentRoutes';
import propertyPdfRoutes from './routes/propertyPdfRoutes';
import tenantPdfRoutes from './routes/tenantPdfRoutes';
import paymentPdfRoutes from './routes/paymentPdfRoutes';
import { checkSubscriptionStatus } from './middleware/subscriptionMiddleware';
import { cacheMiddleware } from './middleware/cacheMiddleware';
import { swaggerUi, specs } from './config/swagger';
import masterDataService from './services/masterDataService';
import { protect } from './middleware/authMiddleware';
import passport from 'passport';
import './config/passport-setup';
// Create the Express app instance
const app: Express = express();
// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);
// --- Security Middleware Setup ---
// Enhanced security headers
app.use(securityHeaders);
// Compression
app.use(compression());
// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com',
  'https://hnv-property.onrender.com',
  'https://www.hnvpm.com',
  'https://hnvpm.com',
  'https://hnv.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Request-Time'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
// Rate limiting - more restrictive for auth endpoints
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 10)); // 10 requests per 15 minutes
app.use('/api', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
// Prevent NoSQL injection
app.use(mongoSanitize());
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Passport middleware
app.use(passport.initialize());
// Input sanitization
app.use(sanitizeInput);
// Request logging
app.use(requestLogger);
// --- Route Setup ---
// Root route for health checks
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HNV Property Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    api: 'working',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HNV1 API Documentation'
}));
// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'OK',
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent'),
    headers: req.headers,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});
// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Client-Version, X-Request-Time');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
// Debug middleware for all API routes - MUST BE FIRST
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});
// Test routes (no auth required)
import testRoutes from './routes/testRoutes';
import testImageRoutes from './routes/testImageRoutes';
import testUploadRoutes from './routes/testUploadRoutes';
app.use('/api/test', testRoutes);
app.use('/api/test/image', testImageRoutes);
app.use('/api/test/upload', testUploadRoutes);
// Health check routes (no auth required)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);
// Route error handler middleware
const routeErrorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(`Route error in ${req.originalUrl}: ${err.message}`);
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};
// Public routes (no auth required) with caching
app.use('/api/public', cacheMiddleware({ ttl: 300 }), publicRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/passkeys', passkeyRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/password-reset', passwordResetRoutes);
// Protected routes (auth required)
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/properties', protect, propertiesRoutes);
app.use('/api/properties', protect, propertyVacantUnitsRoutes);
import propertyRentStatusRoutes from './routes/propertyRentStatusRoutes';
app.use('/api/properties', protect, propertyRentStatusRoutes);
import unitDetailsRoutes from './routes/unitDetailsRoutes';
app.use('/api/properties', protect, unitDetailsRoutes);
app.use('/api/properties', protect, propertyPdfRoutes);
app.use('/api/units', protect, unitRoutes);
app.use('/api/advanced-lease', protect, advancedLeaseRoutes);
app.use('/api/cross-integration', protect, crossIntegrationRoutes);
app.use('/api/advanced-analytics', protect, advancedAnalyticsRoutes);
app.use('/api/enhanced-bulk-payment', protect, enhancedBulkPaymentRoutes);
app.use('/api/tenants', protect, tenantsRoutes);
app.use('/api/tenant-pdf', protect, tenantPdfRoutes);
app.use('/api/payments', protect, paymentsRoutes);
app.use('/api/payment-pdf', protect, paymentPdfRoutes);
app.use('/api/expenses', protect, expenseRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);
app.use('/api/cash-flow', protect, cashFlowRoutes);
app.use('/api/cashflow', protect, cashFlowRoutes);
app.use('/api/reminders', protect, reminderRoutes);
app.use('/api/edit-requests', protect, checkSubscriptionStatus, editRequestRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/users/invites', protect, userRoutes);
app.use('/api/audit', protect, auditRoutes);
app.use('/api/audit-logs', protect, auditRoutes);
app.use('/api/approvals', protect, approvalRoutes);
app.use('/api/org', protect, orgRoutes);
app.use('/api/organization', protect, orgRoutes);
app.use('/api/orgs', protect, orgRoutes);
app.use('/api/subscriptions', protect, subscriptionsRoutes);
app.use('/api/super-admin', protect, superAdminRoutes);
app.use('/api/feedback', protect, feedbackRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/support', protect, supportRoutes);
app.use('/api/mark-as-read', protect, notificationRoutes);
app.use('/api/chat-history', protect, notificationRoutes);
app.use('/api/communication', protect, communicationRoutes);
app.use('/api/sharing', protect, sharingRoutes);
app.use('/api/site-settings', protect, siteSettingsRoutes);
app.use('/api/localization', protect, localizationRoutes);
app.use('/api/translation', cacheMiddleware({ ttl: 600 }), translationRoutes);
app.use('/api/upload', protect, uploadRoutes);
import imageUploadRoutes from './routes/imageUploadRoutes';
app.use('/api/upload/image', protect, imageUploadRoutes);
app.use('/api/file-upload', protect, fileUploadRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/receipts', protect, receiptRoutes);
app.use('/api/receipts', protect, require('./routes/receiptRoutes').default);
app.use('/api/plans', protect, planRoutes);
app.use('/api/export', protect, exportRoutes);
app.use('/api/rent-collection', protect, rentCollectionRoutes);
app.use('/api/rent-increase', protect, rentIncreaseRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/integrations', protect, integrationRoutes);
app.use('/api/subscription', protect, subscriptionRoutes);
app.use('/api/tenant', protect, tenantPortalRoutes);
app.use('/api/tenant-portal', protect, tenantPortalRoutes);
app.use('/api/invitations', protect, invitationRoutes);
app.use('/api/bulk', protect, bulkPaymentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', protect, reportRoutes);
app.use('/api/statements', protect, statementRoutes);
app.use('/api/settings', protect, settingsRoutes);
app.use('/api/agent-handovers', protect, agentHandoverRoutes);
app.use('/api/test-email', testEmailRoutes);
app.use('/api/webhooks', webhookRoutes);

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', req.url);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));
// Error routes
app.use('/api/error', errorRoutes);
// Route error handler
app.use(routeErrorHandler);
// Global error handler (must be last)
app.use(errorHandler);
// Initialize system data
if (process.env.NODE_ENV !== 'test') {
  masterDataService.initializeSystemData().catch(console.error);
  
  // Initialize subscription management cron jobs
  const subscriptionService = require('./services/subscriptionService').default;
  subscriptionService.initializeCronJobs();
}
export { app };
export default app;