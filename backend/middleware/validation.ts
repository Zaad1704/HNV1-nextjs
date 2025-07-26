import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateTenant = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('rentAmount').isNumeric().isFloat({ min: 0 }),
  handleValidationErrors
];

export const validateProperty = [
  body('name').trim().isLength({ min: 2, max: 200 }).escape(),
  body('address').trim().isLength({ min: 5, max: 500 }).escape(),
  body('type').isIn(['apartment', 'house', 'commercial', 'other']),
  handleValidationErrors
];

export const validateUser = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),
  handleValidationErrors
];

export const validatePayment = [
  body('amount').isNumeric().isFloat({ min: 0.01 }),
  body('method').isIn(['cash', 'bank_transfer', 'check', 'online']),
  body('date').isISO8601(),
  handleValidationErrors
];