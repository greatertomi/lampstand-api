import { body } from 'express-validator';

export const registerPushTokenValidationRules = [
  body('userId').optional().isString().withMessage('User ID should be a string'),
  body('pushToken').notEmpty().withMessage('Push token is required'),
  body('platform').notEmpty().withMessage('Platform is required')
];

export const sendNotificationValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required')
];
