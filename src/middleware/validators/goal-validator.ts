import { body } from 'express-validator';

export const createReadingGoalValidationRules = [
  body('goalInMinutes')
    .isInt({ min: 1 })
    .withMessage('goalInMinutes must be a positive integer')
    .custom((value) => {
      if (Number.isNaN(Number(value))) {
        throw new TypeError('goalInMinutes must be a valid number');
      }
      return true;
    }),

  body('reminderTime')
    .notEmpty()
    .withMessage('reminderTime is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('reminderTime must be in HH:MM format')
];
