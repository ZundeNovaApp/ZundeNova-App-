import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').trim().isLength({ min: 2 }),
  body('phone').isMobilePhone('any'),
  body('role').isIn(['FARMER', 'VET', 'DEALER', 'NGO', 'INVESTOR', 'ADMIN']),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

export const validateImageUpload = [
  body('cropType').optional().isString(),
  body('location').optional().isJSON(),
  handleValidationErrors
];

export const validateNDVIRequest = [
  body('fieldId').isString().matches(/^[a-zA-Z0-9_-]+$/),
  body('date').isISO8601(),
  body('bbox').isArray({ min: 4, max: 4 }),
  body('bbox.*').isFloat(),
  handleValidationErrors
];

export const validateChatRequest = [
  body('text').trim().isLength({ min: 1, max: 1000 }),
  body('language').optional().isString().isLength({ min: 2, max: 5 }),
  body('farmId').optional().isString(),
  handleValidationErrors
];

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};
