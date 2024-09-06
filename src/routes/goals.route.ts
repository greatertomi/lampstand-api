import { Router } from 'express';
import { createReadingGoal } from '../controllers/goals.controller';
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

export default router;
