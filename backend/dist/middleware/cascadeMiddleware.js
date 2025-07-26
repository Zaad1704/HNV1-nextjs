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
exports.cascadeTenantChanges = exports.cascadePropertyChanges = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Receipt_1 = __importDefault(require("../models/Receipt"));
const Expense_1 = __importDefault(require("../models/Expense"));
const cascadePropertyChanges = async (propertyId, action, organizationId) => {
    try {
        if (action === 'delete') {
            await Promise.all([
                Tenant_1.default.deleteMany({ propertyId, organizationId }),
                Payment_1.default.deleteMany({ propertyId, organizationId }),
                Receipt_1.default.deleteMany({ propertyId, organizationId }),
                Expense_1.default.deleteMany({ propertyId, organizationId })
            ]);
        }
        else if (action === 'archive') {
            await Promise.all([
                Tenant_1.default.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
                Payment_1.default.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
                Receipt_1.default.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
                Expense_1.default.updateMany({ propertyId, organizationId }, { status: 'Archived' })
            ]);
        }
    }
    catch (error) {
        console.error('Cascade property changes error:', error);
        throw error;
    }
};
exports.cascadePropertyChanges = cascadePropertyChanges;
const cascadeTenantChanges = async (tenantId, action, organizationId) => {
    try {
        const [MaintenanceRequest, Reminder, ApprovalRequest, AuditLog] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/ApprovalRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/AuditLog')))
        ]);
        if (action === 'delete') {
            await Promise.all([
                Payment_1.default.deleteMany({ tenantId, organizationId }),
                Receipt_1.default.deleteMany({ tenantId, organizationId }),
                MaintenanceRequest.default.deleteMany({ tenantId, organizationId }),
                Reminder.default.deleteMany({ tenantId, organizationId }),
                ApprovalRequest.default.deleteMany({ tenantId, organizationId }),
                AuditLog.default.deleteMany({
                    organizationId,
                    $or: [{ resourceId: tenantId }, { 'metadata.tenantId': tenantId }]
                })
            ]);
        }
        else if (action === 'archive') {
            await Promise.all([
                Payment_1.default.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
                Receipt_1.default.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
                MaintenanceRequest.default.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
                Reminder.default.updateMany({ tenantId, organizationId }, { status: 'inactive' }),
                ApprovalRequest.default.updateMany({ tenantId, organizationId }, { status: 'archived' })
            ]);
        }
    }
    catch (error) {
        console.error('Cascade tenant changes error:', error);
        throw error;
    }
};
exports.cascadeTenantChanges = cascadeTenantChanges;
