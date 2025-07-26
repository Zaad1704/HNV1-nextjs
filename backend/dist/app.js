"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const securityMiddleware_1 = require("./middleware/securityMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const invitationRoutes_1 = __importDefault(require("./routes/invitationRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const propertiesRoutes_1 = __importDefault(require("./routes/propertiesRoutes"));
const tenantsRoutes_1 = __importDefault(require("./routes/tenantsRoutes"));
const paymentsRoutes_1 = __importDefault(require("./routes/paymentsRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const cashFlowRoutes_1 = __importDefault(require("./routes/cashFlowRoutes"));
const reminderRoutes_1 = __importDefault(require("./routes/reminderRoutes"));
const editRequestRoutes_1 = __importDefault(require("./routes/editRequestRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const billingRoutes_1 = __importDefault(require("./routes/billingRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const approvalRoutes_1 = __importDefault(require("./routes/approvalRoutes"));
const orgRoutes_1 = __importDefault(require("./routes/orgRoutes"));
const subscriptionsRoutes_1 = __importDefault(require("./routes/subscriptionsRoutes"));
const superAdminRoutes_1 = __importDefault(require("./routes/superAdminRoutes"));
const setupRoutes_1 = __importDefault(require("./routes/setupRoutes"));
const passwordResetRoutes_1 = __importDefault(require("./routes/passwordResetRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const communicationRoutes_1 = __importDefault(require("./routes/communicationRoutes"));
const sharingRoutes_1 = __importDefault(require("./routes/sharingRoutes"));
const siteSettingsRoutes_1 = __importDefault(require("./routes/siteSettingsRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const localizationRoutes_1 = __importDefault(require("./routes/localizationRoutes"));
const translationRoutes_1 = __importDefault(require("./routes/translationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const fileUploadRoutes_1 = __importDefault(require("./routes/fileUploadRoutes"));
const invoiceRoutes_1 = __importDefault(require("./routes/invoiceRoutes"));
const receiptRoutes_1 = __importDefault(require("./routes/receiptRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const errorRoutes_1 = __importDefault(require("./routes/errorRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const rentCollectionRoutes_1 = __importDefault(require("./routes/rentCollectionRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const integrationRoutes_1 = __importDefault(require("./routes/integrationRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const tenantPortalRoutes_1 = __importDefault(require("./routes/tenantPortalRoutes"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const bulkPaymentRoutes_1 = __importDefault(require("./routes/bulkPaymentRoutes"));
const agentHandoverRoutes_1 = __importDefault(require("./routes/agentHandoverRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const statementRoutes_1 = __importDefault(require("./routes/statementRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const twoFactorRoutes_1 = __importDefault(require("./routes/twoFactorRoutes"));
const passkeyRoutes_1 = __importDefault(require("./routes/passkeyRoutes"));
const supportRoutes_1 = __importDefault(require("./routes/supportRoutes"));
const testEmailRoutes_1 = __importDefault(require("./routes/testEmailRoutes"));
const propertyVacantUnitsRoutes_1 = __importDefault(require("./routes/propertyVacantUnitsRoutes"));
const rentIncreaseRoutes_1 = __importDefault(require("./routes/rentIncreaseRoutes"));
const unitRoutes_1 = __importDefault(require("./routes/unitRoutes"));
const advancedLeaseRoutes_1 = __importDefault(require("./routes/advancedLeaseRoutes"));
const crossIntegrationRoutes_1 = __importDefault(require("./routes/crossIntegrationRoutes"));
const advancedAnalyticsRoutes_1 = __importDefault(require("./routes/advancedAnalyticsRoutes"));
const enhancedBulkPaymentRoutes_1 = __importDefault(require("./routes/enhancedBulkPaymentRoutes"));
const propertyPdfRoutes_1 = __importDefault(require("./routes/propertyPdfRoutes"));
const tenantPdfRoutes_1 = __importDefault(require("./routes/tenantPdfRoutes"));
const paymentPdfRoutes_1 = __importDefault(require("./routes/paymentPdfRoutes"));
const subscriptionMiddleware_1 = require("./middleware/subscriptionMiddleware");
const cacheMiddleware_1 = require("./middleware/cacheMiddleware");
const swagger_1 = require("./config/swagger");
const masterDataService_1 = __importDefault(require("./services/masterDataService"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const passport_1 = __importDefault(require("passport"));
require("./config/passport-setup");
const app = (0, express_1.default)();
exports.app = app;
app.set('trust proxy', 1);
app.use(securityMiddleware_1.securityHeaders);
app.use((0, compression_1.default)());
const allowedOrigins = [
    'http://localhost:3000',
    'https://hnv-1-frontend.onrender.com',
    'https://hnv-property.onrender.com',
    'https://www.hnvpm.com',
    'https://hnvpm.com',
    'https://hnv.onrender.com',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Request-Time'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
app.use('/api/auth', (0, securityMiddleware_1.createRateLimit)(15 * 60 * 1000, 10));
app.use('/api', (0, securityMiddleware_1.createRateLimit)(15 * 60 * 1000, 100));
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, hpp_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport_1.default.initialize());
app.use(securityMiddleware_1.sanitizeInput);
app.use(securityMiddleware_1.requestLogger);
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        service: 'HNV Property Management API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        api: 'working',
        timestamp: new Date().toISOString(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HNV1 API Documentation'
}));
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
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Client-Version, X-Request-Time');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
});
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const testImageRoutes_1 = __importDefault(require("./routes/testImageRoutes"));
const testUploadRoutes_1 = __importDefault(require("./routes/testUploadRoutes"));
app.use('/api/test', testRoutes_1.default);
app.use('/api/test/image', testImageRoutes_1.default);
app.use('/api/test/upload', testUploadRoutes_1.default);
app.use('/api/health', healthRoutes_1.default);
app.use('/health', healthRoutes_1.default);
const routeErrorHandler = (err, req, res, next) => {
    console.error(`Route error in ${req.originalUrl}: ${err.message}`);
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};
app.use('/api/public', (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 300 }), publicRoutes_1.default);
app.use('/api/contact', contactRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/2fa', twoFactorRoutes_1.default);
app.use('/api/passkeys', passkeyRoutes_1.default);
app.use('/api/setup', setupRoutes_1.default);
app.use('/api/password-reset', passwordResetRoutes_1.default);
app.use('/api/dashboard', authMiddleware_1.protect, dashboardRoutes_1.default);
app.use('/api/properties', authMiddleware_1.protect, propertiesRoutes_1.default);
app.use('/api/properties', authMiddleware_1.protect, propertyVacantUnitsRoutes_1.default);
const propertyRentStatusRoutes_1 = __importDefault(require("./routes/propertyRentStatusRoutes"));
app.use('/api/properties', authMiddleware_1.protect, propertyRentStatusRoutes_1.default);
const unitDetailsRoutes_1 = __importDefault(require("./routes/unitDetailsRoutes"));
app.use('/api/properties', authMiddleware_1.protect, unitDetailsRoutes_1.default);
app.use('/api/properties', authMiddleware_1.protect, propertyPdfRoutes_1.default);
app.use('/api/units', authMiddleware_1.protect, unitRoutes_1.default);
app.use('/api/advanced-lease', authMiddleware_1.protect, advancedLeaseRoutes_1.default);
app.use('/api/cross-integration', authMiddleware_1.protect, crossIntegrationRoutes_1.default);
app.use('/api/advanced-analytics', authMiddleware_1.protect, advancedAnalyticsRoutes_1.default);
app.use('/api/enhanced-bulk-payment', authMiddleware_1.protect, enhancedBulkPaymentRoutes_1.default);
app.use('/api/tenants', authMiddleware_1.protect, tenantsRoutes_1.default);
app.use('/api/tenant-pdf', authMiddleware_1.protect, tenantPdfRoutes_1.default);
app.use('/api/payments', authMiddleware_1.protect, paymentsRoutes_1.default);
app.use('/api/payment-pdf', authMiddleware_1.protect, paymentPdfRoutes_1.default);
app.use('/api/expenses', authMiddleware_1.protect, expenseRoutes_1.default);
app.use('/api/maintenance', authMiddleware_1.protect, maintenanceRoutes_1.default);
app.use('/api/cash-flow', authMiddleware_1.protect, cashFlowRoutes_1.default);
app.use('/api/cashflow', authMiddleware_1.protect, cashFlowRoutes_1.default);
app.use('/api/reminders', authMiddleware_1.protect, reminderRoutes_1.default);
app.use('/api/edit-requests', authMiddleware_1.protect, subscriptionMiddleware_1.checkSubscriptionStatus, editRequestRoutes_1.default);
app.use('/api/users', authMiddleware_1.protect, userRoutes_1.default);
app.use('/api/users/invites', authMiddleware_1.protect, userRoutes_1.default);
app.use('/api/audit', authMiddleware_1.protect, auditRoutes_1.default);
app.use('/api/audit-logs', authMiddleware_1.protect, auditRoutes_1.default);
app.use('/api/approvals', authMiddleware_1.protect, approvalRoutes_1.default);
app.use('/api/org', authMiddleware_1.protect, orgRoutes_1.default);
app.use('/api/organization', authMiddleware_1.protect, orgRoutes_1.default);
app.use('/api/orgs', authMiddleware_1.protect, orgRoutes_1.default);
app.use('/api/subscriptions', authMiddleware_1.protect, subscriptionsRoutes_1.default);
app.use('/api/super-admin', authMiddleware_1.protect, superAdminRoutes_1.default);
app.use('/api/feedback', authMiddleware_1.protect, feedbackRoutes_1.default);
app.use('/api/notifications', authMiddleware_1.protect, notificationRoutes_1.default);
app.use('/api/support', authMiddleware_1.protect, supportRoutes_1.default);
app.use('/api/mark-as-read', authMiddleware_1.protect, notificationRoutes_1.default);
app.use('/api/chat-history', authMiddleware_1.protect, notificationRoutes_1.default);
app.use('/api/communication', authMiddleware_1.protect, communicationRoutes_1.default);
app.use('/api/sharing', authMiddleware_1.protect, sharingRoutes_1.default);
app.use('/api/site-settings', authMiddleware_1.protect, siteSettingsRoutes_1.default);
app.use('/api/localization', authMiddleware_1.protect, localizationRoutes_1.default);
app.use('/api/translation', (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 600 }), translationRoutes_1.default);
app.use('/api/upload', authMiddleware_1.protect, uploadRoutes_1.default);
const imageUploadRoutes_1 = __importDefault(require("./routes/imageUploadRoutes"));
app.use('/api/upload/image', authMiddleware_1.protect, imageUploadRoutes_1.default);
app.use('/api/file-upload', authMiddleware_1.protect, fileUploadRoutes_1.default);
app.use('/api/invoices', authMiddleware_1.protect, invoiceRoutes_1.default);
app.use('/api/receipts', authMiddleware_1.protect, receiptRoutes_1.default);
app.use('/api/receipts', authMiddleware_1.protect, require('./routes/receiptRoutes').default);
app.use('/api/plans', authMiddleware_1.protect, planRoutes_1.default);
app.use('/api/export', authMiddleware_1.protect, exportRoutes_1.default);
app.use('/api/rent-collection', authMiddleware_1.protect, rentCollectionRoutes_1.default);
app.use('/api/rent-increase', authMiddleware_1.protect, rentIncreaseRoutes_1.default);
app.use('/api/analytics', authMiddleware_1.protect, analyticsRoutes_1.default);
app.use('/api/integrations', authMiddleware_1.protect, integrationRoutes_1.default);
app.use('/api/subscription', authMiddleware_1.protect, subscriptionRoutes_1.default);
app.use('/api/tenant', authMiddleware_1.protect, tenantPortalRoutes_1.default);
app.use('/api/tenant-portal', authMiddleware_1.protect, tenantPortalRoutes_1.default);
app.use('/api/invitations', authMiddleware_1.protect, invitationRoutes_1.default);
app.use('/api/bulk', authMiddleware_1.protect, bulkPaymentRoutes_1.default);
app.use('/api/billing', billingRoutes_1.default);
app.use('/api/reports', authMiddleware_1.protect, reportRoutes_1.default);
app.use('/api/statements', authMiddleware_1.protect, statementRoutes_1.default);
app.use('/api/settings', authMiddleware_1.protect, settingsRoutes_1.default);
app.use('/api/agent-handovers', authMiddleware_1.protect, agentHandoverRoutes_1.default);
app.use('/api/test-email', testEmailRoutes_1.default);
app.use('/api/webhooks', webhookRoutes_1.default);
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.url);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}, express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use('/api/error', errorRoutes_1.default);
app.use(routeErrorHandler);
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    masterDataService_1.default.initializeSystemData().catch(console.error);
    const subscriptionService = require('./services/subscriptionService').default;
    subscriptionService.initializeCronJobs();
}
exports.default = app;
