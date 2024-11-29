import { Router } from 'express';

import { createReadingGoal, deleteReadingGoal, getReadingGoal } from '../controllers';
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
router.get('/', checkJwt, asyncMiddleware(getReadingGoal));
router.delete('/:id', checkJwt, asyncMiddleware(deleteReadingGoal));

export default router;
