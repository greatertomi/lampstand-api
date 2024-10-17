import { Router } from 'express';
import { getUserReadingLogs, logReadingEvent } from '../controllers';
import { asyncMiddleware, checkJwt, logReadingEventValidationRules, validate } from '../middleware';

const router = Router();

router.post(
  '/create',
  checkJwt,
  logReadingEventValidationRules,
  validate,
  asyncMiddleware(logReadingEvent)
);

router.get('/', checkJwt, asyncMiddleware(getUserReadingLogs));

export default router;
