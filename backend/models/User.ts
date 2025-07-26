import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Admin' | 'Manager' | 'Agent' | 'Tenant';
  organizationId?: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending' | 'Archived';
  permissions: string[];
  managedAgentIds: mongoose.Types.ObjectId[];
  managedProperties: mongoose.Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phone?: string;
  profilePicture?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
  twoFactorToken?: string;
  twoFactorExpires?: Date;
  passkeys: Array<{
    id: string;
    publicKey: string;
    counter: number;
    deviceName: string;
    createdAt: Date;
  }>;
  language?: string;
  timezone?: string;
  autoDetectLanguage?: boolean;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    maintenance: boolean;
    payments: boolean;
    invoices: boolean;
  };
  loginHistory?: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    location?: string;
  }>;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  passkeyChallenge?: string;
  passkeyChallengeExpires?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getEmailVerificationToken(): string;
  getPasswordResetToken(): string;
}

const UserSchema = new Schema<IUser>({
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
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    index: true
  },
  password: {
    type: String,
    required: function() {
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
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    index: true
  },
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
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
      validator: function(v: string[]) {
        return v.length <= 50;
      },
      message: 'Cannot have more than 50 permissions'
    }
  },
  managedAgentIds: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    validate: {
      validator: function(v: mongoose.Types.ObjectId[]) {
        return v.length <= 100;
      },
      message: 'Cannot manage more than 100 agents'
    }
  }],
  managedProperties: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Property',
    validate: {
      validator: function(v: mongoose.Types.ObjectId[]) {
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
      validator: function(v: string) {
        return !v || /^[+]?[1-9]\d{1,14}$/.test(v.replace(/[\s()-]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },
  profilePicture: { 
    type: String,
    validate: {
      validator: function(v: string) {
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
      validator: function(v: string) {
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
        validator: function(v: string) {
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

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function() {
  const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  const payload = { 
    id: this._id.toString(), 
    role: this.role, 
    name: this.name,
    organizationId: this.organizationId?.toString()
  };
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  } as jwt.SignOptions;
  return jwt.sign(payload, secret, options);
};

UserSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
};

UserSchema.methods.getPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActiveAt: -1 });

// Virtual for full name display
UserSchema.virtual('displayName').get(function() {
  return this.name || this.email;
});

// Virtual for user activity status
UserSchema.virtual('isOnline').get(function() {
  if (!this.lastActiveAt) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastActiveAt > fiveMinutesAgo;
});

// Pre-save middleware for login history management
UserSchema.pre('save', function(next) {
  // Limit login history to last 50 entries
  if (this.loginHistory && this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  next();
});

// Static methods
UserSchema.statics.findByOrganization = function(organizationId: string) {
  return this.find({ organizationId })
    .select('-password -twoFactorSecret -emailVerificationToken -passwordResetToken')
    .populate('managedProperties', 'name')
    .sort({ createdAt: -1 });
};

UserSchema.statics.findActiveUsers = function(organizationId: string) {
  return this.find({ organizationId, status: 'Active' })
    .select('name email role lastActiveAt')
    .sort({ lastActiveAt: -1 });
};

export default mongoose.model<IUser>('User', UserSchema);