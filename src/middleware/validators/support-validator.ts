import { body } from 'express-validator';

export const supportValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Email should be valid')
    .notEmpty()
    .withMessage('Email is required'),

  body('title').notEmpty().withMessage('Title is required'),

  body('description').notEmpty().withMessage('Description is required')
];
