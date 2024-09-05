import { Router } from 'express';
import { createReadingGoals } from '../controllers/goals.controller';
import { asyncMiddleware, checkJwt } from '../middleware';

const router = Router();

router.post('/reading-book', checkJwt, asyncMiddleware(createReadingGoals));

export default router;
