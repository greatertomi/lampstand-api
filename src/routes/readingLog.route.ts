import { Router } from 'express';
import { getUserReadingLogs, logReadingEvent } from '../controllers';
import {
  asyncMiddleware,
  checkJwt,
  logReadingEventValidationRules,
  readingLogsValidationRules,
  validate
} from '../middleware';

const router = Router();

router.post(
  '/create',
  checkJwt,
  logReadingEventValidationRules,
  validate,
  asyncMiddleware(logReadingEvent)
);

router.get(
  '/',
  checkJwt,
  readingLogsValidationRules,
  validate,
  asyncMiddleware(getUserReadingLogs)
);

export default router;
