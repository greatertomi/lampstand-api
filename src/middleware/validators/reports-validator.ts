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

export const activitiesValidationRule = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.')
    .isISO8601()
    .withMessage('Not a valid date')
];

export const summaryValidationRules = [
  query().custom((_, { req }) => {
    const { date, startDate, endDate } = req.query;
    if (!date && !startDate && !endDate) {
      throw new Error('At least a valid date or both startDate and endDate must be provided');
    }
    return true;
  }),

  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.')
    .isISO8601()
    .withMessage('Not a valid date'),

  query('startDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('startDate must be in YYYY-MM-DD format.')
    .isISO8601()
    .withMessage('Invalid date format.')
    .custom((_, { req }) => {
      if (req.query.date) {
        throw new Error('Cannot use startDate with date.');
      }
      return true;
    })
    .custom((_, { req }) => {
      if (req.query.startDate && !req.query.endDate) {
        throw new Error('Cannot use startDate without endDate.');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('endDate must be a valid date in YYYY-MM-DD format.')
    .isISO8601()
    .withMessage('Invalid date format.')
    .custom((_, { req }) => {
      if (req.query.date) {
        throw new Error('Cannot use endDate with Date.');
      }
      return true;
    })
    .custom((_, { req }) => {
      if (!req.query.startDate && req.query.endDate) {
        throw new Error('Cannot use endDate without startDate.');
      }
      return true;
    })
    .custom((_, { req }) => {
      if (req.query.endDate <= req.query.startDate) {
        throw new Error('endDate must be after startDate.');
      }
      return true;
    })
];
