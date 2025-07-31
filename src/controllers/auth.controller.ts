import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { LoginType, PasswordResetTokenEntity, UserEntity, WaitlistEntity } from '../entities';
import { TokenStatus } from '../entities/types';
import { BcryptHelper, JwtHelper } from '../lib';
import { BadRequestError, HTTP_STATUS, NotFoundError, UnAuthorizeError } from '../lib/responses';
import { logger, sendPasswordResetEmail, sendVerificationEmail } from '../services';
import { JwtPayload } from '../types';
import { generateUniqueToken } from '../utils';
import handleGetRepository from '../utils/handleGetRepository';
import { addLoginHistories } from './utils';

const userNotFound = 'User not found';

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password, agreedToTerms } = req.body;
  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOne({
    where: { email }
  });

  if (user) {
    throw new BadRequestError('Email address already in use');
  }

  const waitlistRepository = handleGetRepository(WaitlistEntity);
  const existingWaitlistUser = await waitlistRepository.findOneBy({ email });

  const isEmailVerified = existingWaitlistUser?.isVerified || false;

  const hashedPassword = await BcryptHelper.hash(password);

  const newUser = userRepository.create({
    fullName,
    email,
    password: hashedPassword,
    agreedToTerms,
    isEmailVerified
  });

  await userRepository.save(newUser);

  const responseData: JwtPayload = {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email
  };
  const token = JwtHelper.generateToken(responseData);
  if (!isEmailVerified) {
    await sendVerificationEmail(responseData);
  }
  await addLoginHistories(newUser.id, LoginType.PASSWORD);

  const response = {
    message: 'User created',
    token,
    data: responseData
  };

  res.status(HTTP_STATUS.CREATED).send(response);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const tokenUser = JwtHelper.verifyToken(token);

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOneBy({ id: tokenUser.id });
  if (!user) {
    throw new NotFoundError(userNotFound);
  }

  await userRepository.update(user.id, { isEmailVerified: true });

  return res
    .status(HTTP_STATUS.OK)
    .send({ message: 'Email verified successfully', data: { userId: user.id } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOne({
    where: { email }
  });

  const isPasswordValid = user ? await BcryptHelper.compare(password, user.password) : false;
  if (!user || !isPasswordValid) {
    throw new NotFoundError('Invalid login credentials');
  }

  const responseData: JwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  };
  const token = JwtHelper.generateToken(responseData);

  await addLoginHistories(user.id, LoginType.PASSWORD);
  Sentry.setUser({ id: user.id });

  res.status(HTTP_STATUS.OK).json({
    message: 'Login successful',
    token,
    data: responseData
  });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userRepository = handleGetRepository(UserEntity);
  const passwordResetTokenRepository = handleGetRepository(PasswordResetTokenEntity);

  const user = await userRepository.findOne({
    where: { email }
  });

  if (!user) {
    throw new NotFoundError('Email not found');
  }
  const token = await generateUniqueToken(passwordResetTokenRepository);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 12);

  const passwordResetToken = passwordResetTokenRepository.create({
    user,
    token,
    expiresAt,
    status: TokenStatus.ACTIVE
  });

  await passwordResetTokenRepository.save(passwordResetToken);

  await sendPasswordResetEmail(user.email, token);
  logger.debug(`Password reset email sent to ${email}`, {
    location: 'Request Password Reset Controller'
  });

  const response = {
    success: true,
    message: 'A 4-digit code has been sent to your email address',
    data: {
      userId: user.id,
      email: user.email
    }
  };

  res.status(HTTP_STATUS.OK).send(response);
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { token, userId } = req.body;

  const numericToken = Number(token);
  if (Number.isNaN(numericToken) || String(numericToken).length !== 4) {
    throw new BadRequestError('Token must be a valid 4-digit number');
  }

  const passwordResetTokenRepository = handleGetRepository(PasswordResetTokenEntity);
  const resetToken = await passwordResetTokenRepository.findOne({
    where: { token, status: TokenStatus.ACTIVE, user: { id: userId } }
  });

  if (!resetToken) {
    throw new BadRequestError('Invalid or expired token');
  }

  if (new Date() > resetToken.expiresAt) {
    await passwordResetTokenRepository.update(resetToken.id, { status: TokenStatus.EXPIRED });

    throw new BadRequestError('Token has expired');
  }

  res.status(HTTP_STATUS.OK).send({ success: true });
};

export const updatePassword = async (req: Request, res: Response) => {
  const { userId, password, token, currentPassword } = req.body;

  const userRepository = handleGetRepository(UserEntity);
  const passwordResetTokenRepository = handleGetRepository(PasswordResetTokenEntity);

  if (token) {
    const userToken = await passwordResetTokenRepository.findOne({
      where: { user: { id: userId }, token }
    });

    if (!userToken) {
      throw new NotFoundError('User with the provided token not found');
    }

    if (userToken.status === TokenStatus.USED) {
      throw new UnAuthorizeError(
        'This token has already been used. You cannot change the password again.'
      );
    }

    const hashedPassword = await BcryptHelper.hash(password);
    await userRepository.update(userId, { password: hashedPassword });

    await passwordResetTokenRepository.update(
      { id: userToken.id },
      {
        status: TokenStatus.USED,
        usedAt: new Date()
      }
    );
    logger.debug(`Password updated successfully for user: ${userId}`, {
      location: 'Update Password Controller'
    });
  } else if (currentPassword) {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await BcryptHelper.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnAuthorizeError('Current password is incorrect');
    }

    const hashedPassword = await BcryptHelper.hash(password);
    await userRepository.update(userId, { password: hashedPassword });

    logger.debug(`Password changed successfully for user: ${userId}`, {
      location: 'Update Password Controller'
    });
  }

  const response = {
    success: true,
    message: 'Password reset successfully'
  };

  res.status(HTTP_STATUS.OK).send(response);
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  const userRepository = handleGetRepository(UserEntity);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    throw new NotFoundError(userNotFound);
  }

  if (user.isEmailVerified) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  const payload: JwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  };

  await sendVerificationEmail(payload);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Verification email resent successfully'
  });
};
