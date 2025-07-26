"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const connectDB = async () => {
    try {
        console.log('⚠️ Database connection skipped - using mock data');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
    }
};
exports.connectDB = connectDB;
