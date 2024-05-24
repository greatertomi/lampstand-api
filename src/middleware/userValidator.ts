import { body } from 'express-validator';

export const userValidationRules = () => [
    body('fullName')
        .exists().withMessage('Full name is required')
        .notEmpty().withMessage('Full name cannot be empty')
        .isString().withMessage('Full name must be a string'),
    body('email')
        .isEmail().withMessage('This must be a proper email address'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must have at least one uppercase letter')
        .matches(/\d/).withMessage('Password must have at least one number')
        .matches(/[!$%&*?@]/).withMessage('Password must have at least one special character'),
    body('agreedToTerms')
        .isBoolean().withMessage('Agreed to terms should be a boolean')
];
