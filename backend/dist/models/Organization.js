"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrganizationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true,
        maxlength: [200, 'Organization name cannot exceed 200 characters'],
        index: true
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required'],
        index: true
    },
    members: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            validate: {
                validator: function (v) {
                    return v.length <= 1000;
                },
                message: 'Cannot have more than 1000 members'
            }
        }],
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Suspended', 'Pending Deletion', 'Archived'],
            message: 'Invalid status'
        },
        default: 'Active',
        index: true
    },
    subscription: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        index: true
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                return !v || /^[A-Z0-9]{6,12}$/.test(v);
            },
            message: 'Invite code must be 6-12 alphanumeric characters'
        }
    },
    settings: {
        timezone: {
            type: String,
            default: 'UTC',
            validate: {
                validator: function (v) {
                    return /^[A-Za-z_]+\/[A-Za-z_]+$/.test(v) || v === 'UTC';
                },
                message: 'Invalid timezone format'
            }
        },
        currency: {
            type: String,
            default: 'USD',
            enum: {
                values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'],
                message: 'Unsupported currency'
            }
        },
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY',
            enum: {
                values: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
                message: 'Invalid date format'
            }
        },
        language: {
            type: String,
            default: 'en',
            enum: {
                values: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko'],
                message: 'Unsupported language'
            }
        }
    },
    branding: {
        companyName: {
            type: String,
            default: '',
            trim: true,
            maxlength: [200, 'Company name cannot exceed 200 characters']
        },
        companyLogoUrl: {
            type: String,
            default: '',
            validate: {
                validator: function (v) {
                    return !v || /^(https?:\/\/)|(\/)/.test(v);
                },
                message: 'Logo URL must be valid'
            }
        },
        companyAddress: {
            type: String,
            default: '',
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters']
        },
        primaryColor: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^#[0-9A-Fa-f]{6}$/.test(v);
                },
                message: 'Primary color must be a valid hex color'
            }
        },
        secondaryColor: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^#[0-9A-Fa-f]{6}$/.test(v);
                },
                message: 'Secondary color must be a valid hex color'
            }
        }
    },
    contact: {
        email: {
            type: String,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Please enter a valid email address'
            }
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^[+]?[1-9]\d{1,14}$/.test(v.replace(/[\s()-]/g, ''));
                },
                message: 'Please enter a valid phone number'
            }
        },
        website: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/.+/.test(v);
                },
                message: 'Website must be a valid URL'
            }
        }
    },
    limits: {
        maxProperties: {
            type: Number,
            default: 100,
            min: [1, 'Must allow at least 1 property'],
            max: [10000, 'Cannot exceed 10000 properties']
        },
        maxTenants: {
            type: Number,
            default: 1000,
            min: [1, 'Must allow at least 1 tenant'],
            max: [100000, 'Cannot exceed 100000 tenants']
        },
        maxUsers: {
            type: Number,
            default: 50,
            min: [1, 'Must allow at least 1 user'],
            max: [1000, 'Cannot exceed 1000 users']
        }
    },
    dataManagement: {
        dataExportRequestedAt: Date,
        accountDeletionRequestedAt: Date,
        lastBackupAt: Date
    },
    allowSelfDeletion: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ owner: 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ inviteCode: 1 }, { unique: true, sparse: true });
OrganizationSchema.virtual('memberCount').get(function () {
    return this.members ? this.members.length : 0;
});
OrganizationSchema.virtual('displayName').get(function () {
    return this.branding?.companyName || this.name;
});
OrganizationSchema.pre('save', function (next) {
    if (!this.inviteCode && this.isNew) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});
OrganizationSchema.statics.findActive = function () {
    return this.find({ status: 'Active' })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
};
OrganizationSchema.statics.findByInviteCode = function (code) {
    return this.findOne({ inviteCode: code.toUpperCase(), status: 'Active' });
};
exports.default = (0, mongoose_1.model)('Organization', OrganizationSchema);
