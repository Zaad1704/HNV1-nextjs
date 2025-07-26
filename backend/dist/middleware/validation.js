"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePayment = exports.validateUser = exports.validateProperty = exports.validateTenant = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateTenant = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).escape(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('rentAmount').isNumeric().isFloat({ min: 0 }),
    exports.handleValidationErrors
];
exports.validateProperty = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 200 }).escape(),
    (0, express_validator_1.body)('address').trim().isLength({ min: 5, max: 500 }).escape(),
    (0, express_validator_1.body)('type').isIn(['apartment', 'house', 'commercial', 'other']),
    exports.handleValidationErrors
];
exports.validateUser = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).escape(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),
    exports.handleValidationErrors
];
exports.validatePayment = [
    (0, express_validator_1.body)('amount').isNumeric().isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('method').isIn(['cash', 'bank_transfer', 'check', 'online']),
    (0, express_validator_1.body)('date').isISO8601(),
    exports.handleValidationErrors
];
