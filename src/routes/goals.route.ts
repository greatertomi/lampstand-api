import { Router } from 'express';
import { createReadingGoal, getReadingGoals } from '../controllers/goals.controller';
import { asyncMiddleware, checkJwt, validate } from '../middleware';
import { createReadingGoalValidationRules } from '../middleware/validators/goal-validator';

const router = Router();

router.post(
  '/create',
  checkJwt,
  createReadingGoalValidationRules,
  validate,
  asyncMiddleware(createReadingGoal)
);
router.get('/', checkJwt, asyncMiddleware(getReadingGoals));
export default router;
