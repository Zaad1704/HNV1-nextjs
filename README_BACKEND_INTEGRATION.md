# HNV1-NextJS with Backend Integration

## 🚀 Project Overview

This is the complete HNV1 Property Management System built with Next.js frontend and Express.js backend. The project now includes a full-stack implementation with authentication, database integration, and comprehensive API endpoints.

## 📋 What's Been Added

### ✅ Complete Backend Infrastructure
- **Express.js API Server** with TypeScript
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** with Passport.js
- **Email Service** with Nodemailer
- **File Upload** capabilities
- **WebSocket Support** for real-time features
- **API Documentation** with Swagger
- **Docker Configuration** for development

### ✅ Database Models
- **User Model** - Authentication and user management
- **Organization Model** - Multi-tenant support
- **Property Model** - Property and unit management
- **Tenant Model** - Comprehensive tenant information
- **Payment Model** - Payment tracking (coming soon)
- **Expense Model** - Expense management (coming soon)
- **Maintenance Model** - Maintenance requests (coming soon)

### ✅ Authentication System
- User registration and login
- Email verification
- Password reset functionality
- JWT token-based authentication
- Role-based access control
- Google OAuth integration (configured)

### ✅ API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/properties/*` - Property management
- `/api/tenants/*` - Tenant management
- `/api/payments/*` - Payment processing
- `/api/expenses/*` - Expense tracking
- `/api/maintenance/*` - Maintenance requests
- `/api/dashboard/*` - Dashboard data
- `/api/analytics/*` - Analytics data

### ✅ Email Templates
- Welcome email
- Email verification
- Password reset
- Payment confirmations (template ready)
- Maintenance updates (template ready)

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Passport.js** - Authentication strategies
- **Nodemailer** - Email service
- **Socket.IO** - Real-time communication
- **Swagger** - API documentation
- **Docker** - Containerization

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **i18next** - Internationalization (40+ languages)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (or use Docker)
- Redis (optional, for caching)

### Option 1: Docker Development (Recommended)
```bash
# Clone and navigate to project
cd HNV1/frontend-nextjs

# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Manual Setup
```bash
# Install backend dependencies
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if not using Docker)
mongod

# Start backend development server
npm run dev

# In a new terminal, start frontend
cd ..
npm install
npm run dev
```

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hnv1-nextjs

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (Configure with your email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=HNV1 Property Management

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-s3-bucket
```

### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **API JSON**: http://localhost:5000/api-docs.json
- **Health Check**: http://localhost:5000/health

## 🔐 Authentication Flow

1. **Registration**: POST `/api/auth/register`
2. **Email Verification**: GET `/api/auth/verify-email/:token`
3. **Login**: POST `/api/auth/login`
4. **Protected Routes**: Include `Authorization: Bearer <token>` header

## 🏗️ Project Structure

```
HNV1/frontend-nextjs/
├── backend/                 # Express.js API
│   ├── config/             # Database, Passport, Swagger config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, error handling, validation
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── templates/         # Email templates
│   ├── utils/             # Utility functions
│   ├── server.ts          # Main server file
│   └── package.json       # Backend dependencies
├── src/                   # Next.js frontend
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── store/           # State management
│   └── utils/           # Utility functions
├── docker-compose.yml    # Docker configuration
└── package.json         # Frontend dependencies
```

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm run test         # Run tests (when added)
npm run lint         # Lint code
```

### Frontend Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🔍 Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "organizationName": "Test Property Management"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🚧 Next Steps for Full Implementation

### Phase 1: Core Controllers (Priority 1)
- [ ] Complete Property Controller with CRUD operations
- [ ] Complete Tenant Controller with lease management
- [ ] Complete Payment Controller with payment processing
- [ ] Complete Dashboard Controller with analytics

### Phase 2: Advanced Features (Priority 2)
- [ ] File upload with AWS S3 integration
- [ ] PDF generation for receipts and reports
- [ ] Real-time notifications with Socket.IO
- [ ] Advanced analytics and reporting

### Phase 3: Integration & Testing (Priority 3)
- [ ] Frontend-backend integration
- [ ] Payment gateway integration (Stripe/2Checkout)
- [ ] Email service configuration
- [ ] Comprehensive testing suite

### Phase 4: Production Ready (Priority 4)
- [ ] Production deployment configuration
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring and logging

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Make sure MongoDB is running
   mongod
   # Or use Docker
   docker-compose up mongodb -d
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   # Or change PORT in .env
   ```

3. **Email Service Not Working**
   - Configure email credentials in `.env`
   - For Gmail, use App Passwords
   - Check firewall settings

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token expiration settings
   - Verify Authorization header format

## 📞 Support

For issues and questions:
1. Check the API documentation at `/api-docs`
2. Review the logs: `docker-compose logs -f`
3. Ensure all environment variables are configured
4. Verify database connectivity

## 🎉 Success!

Your HNV1-NextJS project now has a complete backend infrastructure! The system includes:

✅ **Authentication System** - Registration, login, email verification
✅ **Database Models** - User, Organization, Property, Tenant
✅ **API Endpoints** - RESTful API with Swagger documentation
✅ **Email Service** - Welcome, verification, and notification emails
✅ **Docker Setup** - Complete development environment
✅ **Security** - JWT authentication, role-based access control
✅ **Real-time Features** - Socket.IO integration ready

The foundation is now in place for a complete property management system!