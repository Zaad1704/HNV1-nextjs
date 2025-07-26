"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CollectionSheetSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    periodId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RentCollectionPeriod', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    format: {
        type: { type: String, enum: ['printable', 'digital'], default: 'printable' },
        layout: { type: String, enum: ['compact', 'detailed'], default: 'compact' },
        groupBy: { type: String, enum: ['property', 'dueDate', 'amount', 'none'], default: 'property' }
    },
    sections: {
        header: {
            showLogo: { type: Boolean, default: true },
            showPeriod: { type: Boolean, default: true },
            showSummary: { type: Boolean, default: true },
            customText: String
        },
        tenantList: {
            showCheckboxes: { type: Boolean, default: true },
            showContactInfo: { type: Boolean, default: true },
            showPaymentHistory: { type: Boolean, default: false },
            showNotes: { type: Boolean, default: true },
            sortBy: { type: String, enum: ['property', 'name', 'amount', 'dueDate'], default: 'property' }
        },
        footer: {
            showTotals: { type: Boolean, default: true },
            showSignature: { type: Boolean, default: true },
            showDate: { type: Boolean, default: true }
        }
    },
    customization: {
        fieldsToShow: {
            type: [String],
            default: ['tenant_name', 'property', 'unit', 'rent_due', 'late_fees', 'total_owed', 'due_date', 'contact_phone']
        },
        checkboxStyle: { type: String, enum: ['square', 'circle'], default: 'square' },
        fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
    },
    result: {
        fileUrl: String,
        fileName: String,
        generatedAt: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.default = (0, mongoose_1.model)('CollectionSheet', CollectionSheetSchema);
