import { Router } from 'express';
import { handleGoogleOauthCallback } from '../controllers';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.post('/google-token', asyncMiddleware(handleGoogleOauthCallback));
export default router;
