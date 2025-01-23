import { body, query } from 'express-validator';

export const logReadingEventValidationRules = [
  body('bookId').isUUID().withMessage('Invalid book ID'),
  body('startTime').isISO8601().toDate().withMessage('Invalid start time'),
  body('endTime')
    .isISO8601()
    .toDate()
    .withMessage('Invalid current time')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const readingLogsValidationRules = [
  query('timespan')
    .optional()
    .isString()
    .trim()
    .isIn(['today', 'last7days', 'last30days'])
    .withMessage('Timespan must be one of: today, last7days, last30days')
];
