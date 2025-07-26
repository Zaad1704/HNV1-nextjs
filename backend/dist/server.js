"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const subscriptionCron_1 = require("./scripts/subscriptionCron");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';
const PORT = process.env.PORT || 5000;
console.log('MongoDB URI from env:', process.env.MONGODB_URI);
console.log('Final MongoDB URI:', MONGO_URI);
console.log('Environment:', process.env.NODE_ENV);
const connectDB = async (retries = 5) => {
    try {
        if (!MONGO_URI || (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://'))) {
            throw new Error(`Invalid MongoDB URI format: ${MONGO_URI}`);
        }
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose_1.default.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Database connection error:', error);
        if (retries > 0) {
            console.log(`Retrying database connection... (${retries} attempts left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        }
        else {
            console.error('Failed to connect to database after multiple attempts');
            process.exit(1);
        }
    }
};
const server = (0, http_1.createServer)(app_1.default);
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        mongoose_1.default.connection.close();
        process.exit(0);
    });
});
const startServer = async () => {
    try {
        await connectDB();
        server.listen(Number(PORT), () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            console.log(`🔗 Server URL: http://0.0.0.0:${PORT}`);
            console.log('Database connection state:', mongoose_1.default.connection.readyState);
            if (process.env.NODE_ENV !== 'test') {
                try {
                    (0, subscriptionCron_1.startSubscriptionCron)();
                    console.log('✅ Subscription cron job started');
                }
                catch (cronError) {
                    console.warn('⚠️ Subscription cron job failed to start:', cronError);
                }
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
