import express from 'express';
import { registerUpdatePushToken, sendNotification } from '../controllers';
import {
  registerPushTokenValidationRules,
  sendNotificationValidationRules,
  validate
} from '../middleware';

const router = express.Router();

router.post('/send-notification', sendNotificationValidationRules, validate, sendNotification);
router.post('/register-token', registerPushTokenValidationRules, validate, registerUpdatePushToken);

export default router;
