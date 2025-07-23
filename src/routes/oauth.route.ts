import { Request, Response, Router } from 'express';
import passport from 'passport';
import { handleGoogleOauthCallback, handleMobileGoogleOauthCallback } from '../controllers';
import { HTTP_STATUS } from '../lib/responses';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/oauth/google/failure', session: false }),
  asyncMiddleware(handleGoogleOauthCallback)
);

router.get('/google/failure', (_: Request, res: Response) => {
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Google OAuth failed' });
});

router.post('/mobile/google', asyncMiddleware(handleMobileGoogleOauthCallback));

export default router;
