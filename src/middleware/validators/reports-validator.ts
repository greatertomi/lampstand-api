import { query } from 'express-validator';

export const reportValidationRules = [
  query('currentWeek').optional().isIn(['true']).withMessage('Invalid current week'),

  query('startDate')
    .optional()
    .isDate()
    .withMessage('startDate must be a valid date in YYYY-MM-DD format.')
    .custom((value, { req }) => {
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
    .custom((value, { req }) => {
      if (req.query.startDate && !req.query.endDate) {
        throw new Error('Both startDate and endDate must be provided.');
      }
      return true;
    })
];
