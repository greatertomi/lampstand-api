import { Router } from 'express';
import { getActivityStreaks, getCurrentStreaks, getWeeklyReadingActivities } from '../controllers';
import {
  asyncMiddleware,
  checkJwt,
  reportValidationRules,
  validate,
  weeklyActivitiesValidationRules
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
  '/weekly-reading-activities',
  checkJwt,
  weeklyActivitiesValidationRules,
  validate,
  asyncMiddleware(getWeeklyReadingActivities)
);

export default router;
