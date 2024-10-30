import { Request, Response } from 'express';
import { UserEntity } from '../entities';
import { JwtHelper } from '../lib';
import { HTTP_STATUS } from '../lib/responses';
import { logger } from '../services';
import { LoginHistoryService } from '../services/log-history';
import { JwtPayload } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export interface OAuthUser {
  emails: { value: string }[];
  displayName: string;
  photos?: { value: string }[];
}

export interface AuthenticatedRequest extends Request {
  user: OAuthUser;
}

const generateOAuthResponse = (user: UserEntity, res: Response, status: number) => {
  const responseData: JwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  };
  const token = JwtHelper.generateToken(responseData);

  return res.status(status).json({ message: 'OAuth login successful', token, data: responseData });
};

export const handleGoogleOauthCallback = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    logger.warn('OAuth: No user data received');
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
    await LoginHistoryService.getInstance().logLogin(newUser.id, 'OAuth');
    return generateOAuthResponse(newUser, res, HTTP_STATUS.CREATED);
  }
  await LoginHistoryService.getInstance().logLogin(user.id, 'OAuth');
  return generateOAuthResponse(user, res, HTTP_STATUS.OK);
};
