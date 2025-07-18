import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.IOS_CLIENT_ID;

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID
});

export const handleGoogleOauthCallback = async (req: AuthenticatedRequest, res: Response) => {
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
