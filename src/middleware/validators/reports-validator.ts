import { query } from 'express-validator';

export const reportValidationRules = [
  query('currentWeek').optional().isIn(['true']).withMessage('Invalid current week'),

  query('startDate')
    .optional()
    .isDate()
    .withMessage('startDate must be a valid date in YYYY-MM-DD format.')
    .custom((_, { req }) => {
      if (req.query.currentWeek === 'true') {
        throw new Error('Cannot use startDate with currentWeek.');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .isDate()
    .withMessage('endDate must be a valid date in YYYY-MM-DD format.')
    .custom((_, { req }) => {
      if (req.query.currentWeek === 'true') {
        throw new Error('Cannot use endDate with currentWeek.');
      }
      return true;
    })
    .custom((_, { req }) => {
      if (req.query.startDate && !req.query.endDate) {
        throw new Error('Both startDate and endDate must be provided.');
      }
      return true;
    })
];

export const validateDailyReadingDate = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.')
    .custom((value) => {
      const date = new Date(value);
      const [year, month, day] = value.split('-').map(Number);

      if (
        Number.isNaN(date.getTime()) ||
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
      ) {
        throw new Error('Date is not a valid calendar date.');
      }

      return true;
    })
];

export const weeklyActivitiesValidationRules = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be a valid date in YYYY-MM-DD format.')
];
