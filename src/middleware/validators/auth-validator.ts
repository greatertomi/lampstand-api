import { body } from 'express-validator';
import { passwordValidationRules } from './password-validator';

export const updatePasswordValidationRules = () => [
  body('userId', 'User ID is required').notEmpty(),

  ...passwordValidationRules('currentPassword'),
  ...passwordValidationRules('newPassword'),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('New password and confirm password must be the same');
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
