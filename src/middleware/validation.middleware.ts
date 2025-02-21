import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult, ValidationError } from 'express-validator';

export const validateScrapeRequest = [
  body('url')
    .isURL()
    .withMessage('Must be a valid URL')
    .matches(/^https?:\/\//)
    .withMessage('URL must start with http:// or https://'),
  body('maxPages')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('maxPages must be between 1 and 100'),
  body('proxy').optional().isURL().withMessage('Proxy must be a valid URL'),
  handleValidationErrors,
];

export const validateProductsRequest = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'title_asc', 'title_desc'])
    .withMessage('Invalid sort parameter'),
  handleValidationErrors,
];

function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err: ValidationError) => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg,
      })),
    });
  }
  next();
}
