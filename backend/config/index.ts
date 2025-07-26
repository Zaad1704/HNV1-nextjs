export const config = {
  port: parseInt(process.env.PORT || '5001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hnv',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiry: '24h',
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutes
  },
  cache: {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultTTL: 3600, // 1 hour
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  security: {
    corsOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    fileUploadLimit: 5 * 1024 * 1024, // 5MB
  },
  features: {
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
    enableRealtime: process.env.ENABLE_REALTIME === 'true',
  },
  external: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  }
};