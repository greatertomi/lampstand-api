import { Router } from 'express';
import { getActivityStreaks, getCurrentStreaks } from '../controllers';
import { asyncMiddleware, checkJwt, reportValidationRules, validate } from '../middleware';

const router = Router();

router.get(
  '/activity-streaks',
  checkJwt,
  reportValidationRules,
  validate,
  asyncMiddleware(getActivityStreaks)
);

router.get('/current-streaks', checkJwt, validate, asyncMiddleware(getCurrentStreaks));
export default router;
