"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        },
        index: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['Super Admin', 'Super Moderator', 'Admin', 'Manager', 'Agent', 'Tenant'],
            message: 'Invalid role'
        },
        default: 'Admin',
        index: true
    },
    organizationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
    tenantId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true
    },
    googleId: {
        type: String,
        sparse: true,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Suspended', 'Pending', 'Archived'],
            message: 'Invalid status'
        },
        default: 'Active',
        index: true
    },
    permissions: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 50;
            },
            message: 'Cannot have more than 50 permissions'
        }
    },
    managedAgentIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            validate: {
                validator: function (v) {
                    return v.length <= 100;
                },
                message: 'Cannot manage more than 100 agents'
            }
        }],
    managedProperties: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Property',
            validate: {
                validator: function (v) {
                    return v.length <= 1000;
                },
                message: 'Cannot manage more than 1000 properties'
            }
        }],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^[+]?[1-9]\d{1,14}$/.test(v.replace(/[\s()-]/g, ''));
            },
            message: 'Please enter a valid phone number'
        }
    },
    profilePicture: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^(https?:\/\/)|(\/)/.test(v);
            },
            message: 'Profile picture must be a valid URL'
        }
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorTempSecret: { type: String, select: false },
    twoFactorToken: { type: String, select: false },
    twoFactorExpires: { type: Date, select: false },
    passkeys: [{
            id: { type: String, required: true },
            publicKey: { type: String, required: true },
            counter: { type: Number, default: 0 },
            deviceName: {
                type: String,
                required: true,
                maxlength: [100, 'Device name cannot exceed 100 characters']
            },
            createdAt: { type: Date, default: Date.now }
        }],
    language: {
        type: String,
        default: 'en',
        enum: {
            values: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko'],
            message: 'Unsupported language'
        }
    },
    timezone: {
        type: String,
        default: 'UTC',
        validate: {
            validator: function (v) {
                return !v || /^[A-Za-z_]+\/[A-Za-z_]+$/.test(v) || v === 'UTC';
            },
            message: 'Invalid timezone format'
        }
    },
    autoDetectLanguage: { type: Boolean, default: true },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        maintenance: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        invoices: { type: Boolean, default: true }
    },
    loginHistory: [{
            timestamp: { type: Date, default: Date.now },
            ipAddress: {
                type: String,
                validate: {
                    validator: function (v) {
                        return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(v);
                    },
                    message: 'Invalid IP address format'
                }
            },
            userAgent: {
                type: String,
                maxlength: [500, 'User agent cannot exceed 500 characters']
            },
            location: {
                type: String,
                maxlength: [200, 'Location cannot exceed 200 characters']
            }
        }],
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date, default: Date.now },
    passkeyChallenge: { type: String, select: false },
    passkeyChallengeExpires: { type: Date, select: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password)
        return false;
    return await bcrypt.compare(enteredPassword, this.password);
};
UserSchema.methods.getSignedJwtToken = function () {
    const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const payload = {
        id: this._id.toString(),
        role: this.role,
        name: this.name,
        organizationId: this.organizationId?.toString()
    };
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
UserSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return verificationToken;
};
UserSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
};
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActiveAt: -1 });
UserSchema.virtual('displayName').get(function () {
    return this.name || this.email;
});
UserSchema.virtual('isOnline').get(function () {
    if (!this.lastActiveAt)
        return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastActiveAt > fiveMinutesAgo;
});
UserSchema.pre('save', function (next) {
    if (this.loginHistory && this.loginHistory.length > 50) {
        this.loginHistory = this.loginHistory.slice(-50);
    }
    next();
});
UserSchema.statics.findByOrganization = function (organizationId) {
    return this.find({ organizationId })
        .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
        .populate('managedProperties', 'name')
        .sort({ createdAt: -1 });
};
UserSchema.statics.findActiveUsers = function (organizationId) {
    return this.find({ organizationId, status: 'Active' })
        .select('name email role lastActiveAt')
        .sort({ lastActiveAt: -1 });
};
exports.default = mongoose_1.default.model('User', UserSchema);
