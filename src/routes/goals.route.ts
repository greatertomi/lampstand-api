import { Router } from 'express';
import {
  createReadingGoal,
  deleteReadingGoal,
  getReadingGoals, updateReadingGoal
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
router.delete('/reading-goals/:id', checkJwt, asyncMiddleware(deleteReadingGoal));


router.put(
  '/:id',
  checkJwt,
  updateReadingGoalValidationRules,
  validate,
  asyncMiddleware(updateReadingGoal)
);
export default router;
