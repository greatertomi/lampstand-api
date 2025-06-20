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

export const readingSummaryValidationRules = [
  query().custom((_, { req }) => {
    const { date, startDate, endDate } = req.query;

    const hasDate = !!date;
    const hasStartDate = !!startDate;
    const hasEndDate = !!endDate;

    const isDateOnly = hasDate && !hasStartDate && !hasEndDate;
    const isDateRangeOnly = !hasDate && hasStartDate && hasEndDate;

    if (isDateOnly || isDateRangeOnly) {
      return true;
    }

    if (hasDate) {
      throw new Error('When using date, startDate and endDate must not be provided.');
    }
    if (hasStartDate || hasEndDate) {
      throw new Error('Both startDate and endDate must be provided, and date must not be.');
    }
    throw new Error('Either date or both startDate and endDate must be provided.');
  }),

  query('date')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Date must be in YYYY-MM-DD format.'),

  query('startDate')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('startDate must be in YYYY-MM-DD format.'),

  query('endDate')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('endDate must be in YYYY-MM-DD format.')
    .custom((value, { req }) => {
      const { startDate } = req.query;
      if (startDate && value && new Date(value as string) <= new Date(startDate as string)) {
        throw new Error('endDate must be after startDate.');
      }
      return true;
    })
];
