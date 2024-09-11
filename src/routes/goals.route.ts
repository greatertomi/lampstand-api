import { Router } from 'express';
import {
  createReadingGoal,
  getReadingGoals,
  updateReadingGoal
} from '../controllers/goals.controller';
import { asyncMiddleware, checkJwt, validate } from '../middleware';
import {
  createReadingGoalValidationRules,
  updateReadingGoalValidationRules
} from '../middleware/validators/goal-validator';

const router = Router();

router.post(
  '/create',
  checkJwt,
  createReadingGoalValidationRules,
  validate,
  asyncMiddleware(createReadingGoal)
);
router.get('/', checkJwt, asyncMiddleware(getReadingGoals));

router.put('/update/:id', checkJwt, updateReadingGoalValidationRules, validate, updateReadingGoal);
export default router;
