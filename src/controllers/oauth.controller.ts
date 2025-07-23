import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import envConfig from '../config/envConfig';
import { LoginType, UserEntity } from '../entities';
import { JwtHelper } from '../lib';
import { HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';
import { JwtPayload } from '../types';
import handleGetRepository from '../utils/handleGetRepository';
import { addLoginHistories } from './utils';

export interface OAuthUser {
  emails: { value: string }[];
  displayName: string;
  photos?: { value: string }[];
}

export interface AuthenticatedRequest extends Request {
  user: OAuthUser;
}

const oauthRoute = 'api/v1/google';

const generateOAuthResponse = async (user: UserEntity, res: Response, status: number) => {
  const responseData: JwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  };
  const token = JwtHelper.generateToken(responseData);
  await addLoginHistories(user.id, LoginType.OAUTH);

  return res.status(status).json({ message: 'OAuth login successful', token, data: responseData });
};

export const handleGoogleOauthCallback = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    logger.warn('OAuth: No user data received', {
      location: 'handleGoogleOauthCallback',
      route: oauthRoute
    });
    return res.redirect('/oauth/google/failure');
  }

  const oauthUser = {
    email: req.user.emails[0].value,
    fullName: req.user.displayName,
    profilePicture: req.user.photos?.[0]?.value
  };

  const userRepository = handleGetRepository(UserEntity);
  const user = await userRepository.findOne({ where: { email: oauthUser.email } });

  if (!user) {
    const newUser = userRepository.create({
      fullName: oauthUser.fullName,
      email: oauthUser.email,
      agreedToTerms: true,
      isOAuthUser: true,
      profilePicture: oauthUser.profilePicture
    });
    await userRepository.save(newUser);

    logger.info('OAuth user account created successfully', {
      location: 'handleGoogleOauthCallback',
      route: oauthRoute
    });

    return generateOAuthResponse(newUser, res, HTTP_STATUS.CREATED);
  }
  logger.info('Existing OAuth user logged in successfully', {
    location: 'handleGoogleOauthCallback',
    route: oauthRoute
  });
  return generateOAuthResponse(user, res, HTTP_STATUS.OK);
};

export const handleMobileGoogleOauthCallback = async (req: AuthenticatedRequest, res: Response) => {
  const GOOGLE_CLIENT_ID = envConfig.GOOGLE_CLIENT_ID;
  const ANDROID_CLIENT_ID = envConfig.ANDROID_CLIENT_ID;
  const IOS_CLIENT_ID = envConfig.IOS_CLIENT_ID;

  const client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID
  });

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Missing or invalid token' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [GOOGLE_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID]
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid token payload' });
    }

    const userRepository = handleGetRepository(UserEntity);
    let user = await userRepository.findOneBy({ email: payload.email });

    if (!user) {
      user = userRepository.create({
        fullName: payload.name,
        email: payload.email,
        profilePicture: payload.picture,
        agreedToTerms: true,
        isOAuthUser: true
      });
      await userRepository.save(user);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    };

    const jwtToken = JwtHelper.generateToken(jwtPayload);
    await addLoginHistories(user.id, LoginType.OAUTH);

    return res.json({
      message: 'OAuth login successful',
      data: jwtPayload,
      token: jwtToken
    });
  } catch (error) {
    logger.error('Google ID token verification failed:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Authentication failed' });
  }
};
