import { Router } from 'express';
import { registerUpdatePushToken, sendNotification } from '../controllers';
// import {
//   registerPushTokenValidationRules,
//   sendNotificationValidationRules,
//   validate
// } from '../middleware';
import {
  registerPushTokenValidationRules,
  sendNotificationValidationRules
} from '../middleware/validators/notifications-validator';
import { validate } from '../middleware/validators/validate';

const router = Router();

router.post('/send-notification', sendNotificationValidationRules, validate, sendNotification);
router.post('/register-token', registerPushTokenValidationRules, validate, registerUpdatePushToken);

export default router;
