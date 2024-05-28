import { body } from 'express-validator';
import { UserEntity } from '../entities';
import { BadRequestError } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';

export const userValidationRules = () => [
  body('fullName')
    .exists()
    .withMessage('Full name is required')
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isString()
    .withMessage('Full name must be a string'),
  body('email')
    .isEmail()
    .withMessage('This must be a proper email address')
    .custom(async (email: string) => {
      const user = await handleGetRepository(UserEntity).findOne({
        where: { emailAddress: email }
      });
      if (user) {
        throw new BadRequestError('Email address already in use');
      }
    })
    .withMessage('Email address already in use'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must have at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must have at least one number')
    .matches(/[!$%&*?@]/)
    .withMessage('Password must have at least one special character'),
  body('agreedToTerms').isBoolean().withMessage('Agreed to terms should be a boolean')
];
