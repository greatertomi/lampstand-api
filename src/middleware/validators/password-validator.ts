import { body } from 'express-validator';

export const passwordValidationRules = () => [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must have at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must have at least one number')
    .matches(/[!#$%&*?@]/)
    .withMessage('Password must have at least one special character')
];
