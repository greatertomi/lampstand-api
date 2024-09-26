import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserEntity } from '../entities';
import { logger } from '../services';
import handleGetRepository from '../utils/handleGetRepository';
import envConfig from './envConfig';

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.CLIENT_ID!,
      clientSecret: envConfig.CLIENT_SECRET!,
      callbackURL: 'http://localhost:8000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = handleGetRepository(UserEntity);
        let user = await userRepository.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = userRepository.create({
            googleId: profile.id,
            fullName: profile.displayName,
            emailAddress: profile.emails?.[0]?.value,
            isEmailVerified: true,
            agreedToTerms: true
          });
          await userRepository.save(user);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Error in Google Strategy:', error);
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: UserEntity, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = handleGetRepository(UserEntity);
    const user = await userRepository.findOneBy({ id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
