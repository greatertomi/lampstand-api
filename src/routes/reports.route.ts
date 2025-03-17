import { Router } from 'express';
import { getActivityStreaks } from '../controllers';
import { asyncMiddleware, checkJwt, reportValidationRules, validate } from '../middleware';

const router = Router();

router.get(
  '/activity-streaks',
  checkJwt,
  reportValidationRules,
  validate,
  asyncMiddleware(getActivityStreaks)
);

export default router;

