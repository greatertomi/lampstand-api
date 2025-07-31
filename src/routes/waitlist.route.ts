import express from 'express';
import { checkWaitlistEmail, saveWaitlistEmail, verifyWaitlistEmail } from '../controllers';
import {
  asyncMiddleware,
  validate,
  wailistQueryValidationRules,
  waitlistValidationRules
} from '../middleware';

const router = express.Router();

router.post('/save-email', waitlistValidationRules, validate, asyncMiddleware(saveWaitlistEmail));
router.get(
  '/check-email',
  wailistQueryValidationRules,
  validate,
  asyncMiddleware(checkWaitlistEmail)
);
router.post(
  '/verify-email',
  waitlistValidationRules,
  validate,
  asyncMiddleware(verifyWaitlistEmail)
);

export default router;
