import { body, query } from 'express-validator';

export const waitlistValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Email should be valid')
    .notEmpty()
    .withMessage('Email is required'),

  body('phoneNumber')
  .isMobilePhone('any')
  .withMessage('Phone number should be valid')
  .notEmpty()
  .withMessage('Phone number is required'),

];


export const wailistQueryValidationRules = [
  query('email')
    .isEmail()
    .withMessage('Email should be valid')
    .notEmpty()
    .withMessage('Email is required')
];
