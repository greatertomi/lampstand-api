import { Router } from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { asyncMiddleware, checkJwt } from '../middleware';

const router = Router();
router.get('/me', checkJwt, asyncMiddleware(getUserProfile));

export default router;
