"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect('mongodb://127.0.0.1:27017/hnv1-nextjs', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
    }
    catch (error) {
        console.log('⚠️ MongoDB not available, using in-memory storage');
    }
};
exports.connectDB = connectDB;
