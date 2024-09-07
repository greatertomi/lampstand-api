import { body } from 'express-validator';

export const createReadingGoalValidationRules = [
  body('goalInMinutes').isInt({ min: 1 }).withMessage('goalInMinutes must be a positive integer'),

  body('reminderTime')
    .notEmpty()
    .withMessage('reminderTime is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('reminderTime must be in HH:MM format')
];
