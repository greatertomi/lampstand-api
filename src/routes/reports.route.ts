import { Router } from 'express';
import {
  getActivityStreaks,
  getCurrentStreaks,
  getDailyReadingActivityData,
  getReadingSummaryData,
  getWeeklyReadingActivities
} from '../controllers';
import {
  activitiesValidationRule,
  asyncMiddleware,
  checkJwt,
  reportValidationRules,
  summaryValidationRules,
  validate
} from '../middleware';

const router = Router();

router.get(
  '/activity-streaks',
  checkJwt,
  reportValidationRules,
  validate,
  asyncMiddleware(getActivityStreaks)
);

router.get('/current-streaks', checkJwt, validate, asyncMiddleware(getCurrentStreaks));
router.get(
  '/daily-reading-activities',
  checkJwt,
  activitiesValidationRule,
  validate,
  asyncMiddleware(getDailyReadingActivityData)
);

router.get(
  '/weekly-reading-activities',
  checkJwt,
  activitiesValidationRule,
  validate,
  asyncMiddleware(getWeeklyReadingActivities)
);

router.get(
  '/reading-summary',
  checkJwt,
  summaryValidationRules,
  validate,
  asyncMiddleware(getReadingSummaryData)
);

export default router;
