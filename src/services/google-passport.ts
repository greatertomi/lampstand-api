import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import envConfig from '../config/envConfig';
import { logger } from './logger';

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/oauth/google/callback'
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (error) {
        logger.error('Error in Google OAuth', error);
        return done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
