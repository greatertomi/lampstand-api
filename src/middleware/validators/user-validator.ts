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

export const uploadPictureValidationRules = () => [
  body('profilePicture')
    .custom((_, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only JPEG, JPG, and PNG files are allowed');
      }
      return true;
    })
    .withMessage('Invalid file upload')
];

export const updateUserValidationRules = () => [
  body('fullName')
    .exists()
    .withMessage('Full name is required')
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isString()
    .withMessage('Full name must be a string')
    .isLength({ min: 3 })
    .withMessage('Full name must be more than 3 characters')
    .matches(/^[\sA-Za-z]+$/)
    .withMessage('Full name can not be a number'),
  body('email').not().exists().withMessage('Email should not be included in update request')
];
