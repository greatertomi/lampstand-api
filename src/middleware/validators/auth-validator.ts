import { body } from 'express-validator';
import { passwordValidationRules } from './password-validator';

export const updatePasswordValidationRules = () => [
  body('userId', 'User ID is required').notEmpty(),
  body('token')
    .optional()
    .notEmpty()
    .withMessage('Token is required')
    .isNumeric()
    .withMessage('Token must be a number')
    .toInt(),
  ...passwordValidationRules(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and confirm password must be the same');
    }
    return true;
  }),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Password is required')
    .custom((value, { req }) => {
      if (value === req.body.password) {
        throw new Error('New password must be different');
      }
      return true;
    }),
  ...passwordValidationRules(),

  body('token', 'Either token or current password must be provided').custom((value, { req }) => {
    if (!value && !req.body.currentPassword) {
      throw new Error('Either token or current password must be provided');
    }
    return true;
  })
];
export const forgotPasswordValidationRules = () => [
  body('email', 'This must be a valid email address').isEmail()
];

export const verifyResetTokenValidationRules = () => [
  body('userId', 'User ID is required').notEmpty(),
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isNumeric()
    .withMessage('Token must be a number')
    .toInt()
];

export const resendPasswordTokenValidationRules = () => [
  body('userId').notEmpty().withMessage('User ID is missing').bail().isUUID().withMessage('Invalid User ID format'),
];
