import { body } from 'express-validator';
import { passwordValidationRules } from './password-validator';

export const userValidationRules = () => [
  body('fullName')
    .exists()
    .withMessage('Full name is required')
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isString()
    .withMessage('Full name must be a string'),
  body('email').isEmail().withMessage('This must be a proper email address'),
  ...passwordValidationRules(),
  body('agreedToTerms').isBoolean().withMessage('Agreed to terms should be a boolean')
];

export const loginValidationRules = () => [
  body('email', 'This must be a valid email address').isEmail(),
  ...passwordValidationRules()
];
