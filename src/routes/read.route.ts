import { Router } from 'express';
import { logReadingEvent } from '../controllers';
import { asyncMiddleware, checkJwt, logReadingEventValidationRules, validate } from '../middleware';

const router = Router();

router.post(
  '/log-reading',
  checkJwt,
  logReadingEventValidationRules,
  validate,
  asyncMiddleware(logReadingEvent)
);

export default router;
