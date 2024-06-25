import { body } from 'express-validator';

export const updatePasswordValidationRules = () => [
  body('userId', 'User ID is required').notEmpty(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must have at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must have at least one number')
    .matches(/[!$%&*?@]/)
    .withMessage('Password must have at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and confirm password must be the same');
    }
    return true;
  })
];
export const forgotPasswordValidationRules = () => [
  body('email', 'This must be a valid email address').isEmail()
];


// was trying to change usw this, but it made my endpoint to be loading for long
//export const resetPasswordValidationRules = () => [
  //body('token', 'Token is required').notEmpty().isNumeric().toInt(),
//];
