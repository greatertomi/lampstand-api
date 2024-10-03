import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import { handleGoogleOauthCallback } from '../controllers';
import { HTTP_STATUS } from '../lib/responses';
import { asyncMiddleware } from '../middleware';

const router = Router();

router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })(req, res, next);
});

router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'google',
    { failureRedirect: '/oauth/google/failure', session: false },
    (err: Error, user: string) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/oauth/google/failure');
      }
      req.user = user;
      return asyncMiddleware(handleGoogleOauthCallback)(req, res, next);
    }
  )(req, res, next);
});

router.get('/google/failure', (_: Request, res: Response) => {
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Google OAuth failed' });
});

export default router;
