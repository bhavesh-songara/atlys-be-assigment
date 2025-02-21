import { Request, Response, NextFunction } from 'express';
import { header, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

export const validateApiKey = [
  header('x-api-key')
    .exists()
    .withMessage('API key is required')
    .notEmpty()
    .withMessage('API key cannot be empty')
    .custom((value) => {
      if (value !== process.env.API_TOKEN) {
        throw new Error('Invalid API key');
      }
      return true;
    }),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({
      success: false,
      errors: errors.array().map((err) => ({
        type: 'auth',
        message: err.msg,
      })),
    });
  }
  next();
};

export const authMiddleware = [...validateApiKey, handleValidationErrors];
