# 🚀 Render.com Deployment Guide for HNV1

## 📋 **Pre-Deployment Checklist**

### ✅ **Files Created/Updated:**
- `render.yaml` - Render deployment configuration
- `next.config.js` - Next.js static export config
- `backend/package.json` - Backend dependencies and scripts
- `backend/tsconfig.json` - TypeScript configuration
- `.env.production` - Production environment variables

## 🔧 **Deployment Steps**

### **1. Backend Deployment**
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `JWT_SECRET=<generate-random-secret>`
   - `FRONTEND_URL=https://your-frontend-url.onrender.com`

### **2. Database Setup**
1. Create MongoDB Atlas cluster (free tier)
2. Get connection string
3. Add to backend environment variables

### **3. Frontend Deployment**
1. Create new Static Site on Render
2. Connect same GitHub repository
3. Set build command: `npm install && npm run build`
4. Set publish directory: `./out`
5. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api`

## 🌐 **URLs Structure**
- **Backend**: `https://hnv1-backend.onrender.com`
- **Frontend**: `https://hnv1-frontend.onrender.com`
- **API Endpoints**: `https://hnv1-backend.onrender.com/api/*`

## 🔒 **Environment Variables**

### **Backend (.env)**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hnv1-nextjs
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
FRONTEND_URL=https://hnv1-frontend.onrender.com
EMAIL_FROM=noreply@hnv1.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (.env.production)**
```
NEXT_PUBLIC_API_URL=https://hnv1-backend.onrender.com/api
```

## 📦 **Build Configuration**

### **Next.js Config (next.config.js)**
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### **Backend Package.json Scripts**
```json
{
  "scripts": {
    "dev": "ts-node server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "npm run build"
  }
}
```

## 🚀 **Deployment Process**

1. **Push to GitHub**: All changes committed and pushed
2. **Deploy Backend**: 
   - Create web service
   - Set environment variables
   - Deploy automatically
3. **Deploy Frontend**:
   - Create static site
   - Set build command
   - Deploy automatically

## 🔍 **Testing Deployment**

### **Backend Health Check**
```bash
curl https://hnv1-backend.onrender.com/health
```

### **API Test**
```bash
curl https://hnv1-backend.onrender.com/api/dashboard/stats
```

### **Frontend Access**
Visit: `https://hnv1-frontend.onrender.com`

## 🎯 **Production Features**

### ✅ **Backend Ready**
- Express server with TypeScript
- MongoDB integration
- JWT authentication
- Rate limiting
- CORS configuration
- Error handling
- API documentation

### ✅ **Frontend Ready**
- Next.js static export
- API client configured
- Authentication flow
- Dashboard with real data
- Responsive design
- Error handling

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **Build Fails**: Check TypeScript compilation
2. **API Not Found**: Verify CORS and URL configuration
3. **Database Connection**: Check MongoDB URI and network access
4. **Environment Variables**: Ensure all required vars are set

### **Logs Access:**
- Backend logs: Render dashboard → Service → Logs
- Build logs: Render dashboard → Service → Events

## 🎉 **Deployment Complete!**

Your HNV1 Property Management System is now live on Render.com with:
- ✅ Production-ready backend API
- ✅ Static frontend deployment
- ✅ MongoDB database integration
- ✅ Full authentication system
- ✅ Real-time data synchronization

**Ready for production use!** 🚀