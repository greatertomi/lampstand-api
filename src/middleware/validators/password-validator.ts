import { body } from 'express-validator';

export const passwordValidationRules = () => [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];
