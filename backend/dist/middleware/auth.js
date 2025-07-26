"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'No user found with this token'
                });
            }
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.protect = protect;
exports.default = exports.protect;
