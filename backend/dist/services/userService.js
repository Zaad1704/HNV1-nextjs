"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async createUser(userData) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
            const user = new User_1.default({
                ...userData,
                password: hashedPassword
            });
            await user.save();
            return user;
        }
        catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const user = await User_1.default.findById(userId).select('-password');
            return user;
        }
        catch (error) {
            console.error('Failed to get user by ID:', error);
            return null;
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await User_1.default.findOne({ email });
            return user;
        }
        catch (error) {
            console.error('Failed to get user by email:', error);
            return null;
        }
    }
    async updateUser(userId, updateData) {
        try {
            const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
            return user;
        }
        catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }
    async validatePassword(plainPassword, hashedPassword) {
        try {
            return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
        }
        catch (error) {
            console.error('Failed to validate password:', error);
            return false;
        }
    }
}
exports.default = new UserService();
