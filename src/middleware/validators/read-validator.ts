import { body } from 'express-validator';

export const logReadingEventValidationRules = [
  body('bookId').isUUID().withMessage('Invalid book ID'),
  body('startTime').isISO8601().toDate().withMessage('Invalid start time'),
  body('currentTime')
    .isISO8601()
    .toDate()
    .withMessage('Invalid current time')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('Current time must be after start time');
      }
      return true;
    })
];
