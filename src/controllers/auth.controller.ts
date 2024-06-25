import { Request, Response } from 'express';
import { PasswordResetToken, UserEntity } from '../entities';
import { BcryptHelper, JwtHelper } from '../lib';
import { BadRequestError, HTTP_STATUS, NotFoundError } from '../lib/responses';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/sendemail';
import handleGetRepository from '../utils/handleGetRepository';
import { logger } from '../services';
const userNotFound = ('User not found');


export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password, agreedToTerms } = req.body;
  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOne({
    where: { emailAddress: email }
  });

  if (user) {
    throw new BadRequestError('Email address already in use');
  }

  const hashedPassword = await BcryptHelper.hash(password);

  const newUser = userRepository.create({
    fullName,
    emailAddress: email,
    password: hashedPassword,
    agreedToTerms
  });

  await userRepository.save(newUser);

  const token = JwtHelper.generateToken(newUser.id);
  await sendVerificationEmail(newUser.emailAddress, newUser.id);

  const response = {
    message: 'User created',
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.emailAddress,
      token
    }
  };

  res.status(HTTP_STATUS.CREATED).send(response);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const { userId } = JwtHelper.verifyToken(token);

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundError(userNotFound);
  }

  await userRepository.update(user.id, { isEmailVerified: true });
  return res
    .status(HTTP_STATUS.OK)
    .send({ message: 'Email verified successfully', data: { userId } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOne({
    where: { emailAddress: email }
  });

  const checkPassword = user ? await BcryptHelper.compare(password, user.password) : false;
  if (!user || !checkPassword) {
    throw new NotFoundError('Invalid login credentials');
  }
  const token = JwtHelper.generateToken(user.id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Login successful',
    token,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.emailAddress,
    }
  });
};


 export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userRepository = handleGetRepository(UserEntity);
  const passwordResetTokenRepository = handleGetRepository(PasswordResetToken);

  const user = await userRepository.findOne({
    where: { emailAddress: email }
  });

  if (!user) {
    throw new NotFoundError('Email not found');
  }

  const token = Math.floor(100_000 + Math.random() * 900_000);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 12);

  const passwordResetToken = passwordResetTokenRepository.create({
    user,
    token,
    expiresAt,
    status: 'active'
  });

  await passwordResetTokenRepository.save(passwordResetToken);

  // Send email to the user
  try {
    await sendPasswordResetEmail(user.emailAddress, token);
    logger.debug(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}`, error);
    throw new BadRequestError('Failed to send reset email');
  }
  const response = {
    success: true,
    message: 'A 6-digit code has been sent to your email address'
  };

  res.status(HTTP_STATUS.OK).send(response);
};


export const verifyResetToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (token === undefined || token === null) {
    throw new BadRequestError('Token is missing in the request body');
  }

  const numericToken = Number(token);
  if (Number.isNaN(numericToken) || numericToken <= 0) {
    throw new BadRequestError('Token must be a valid number');
  }

  const passwordResetTokenRepository = handleGetRepository(PasswordResetToken);
  const userRepository = handleGetRepository(UserEntity);

  const resetToken = await passwordResetTokenRepository.findOne({
    where: { token: token, status: 'active' },
    relations: ['user']
  });

  if (!resetToken) {
    throw new NotFoundError('Invalid or expired token');
  }

  if (new Date() > resetToken.expiresAt) {
    resetToken.status = 'expired';
    await passwordResetTokenRepository.save(resetToken);
    throw new BadRequestError('Token has expired');
  }

  const user = await userRepository.findOne({
    where: { id: resetToken.user.id }
  });

  if (!user) {
    logger.error(`User not found for valid reset token: ${token}`);
    throw new NotFoundError(userNotFound);
  }

  const response = {
    success: true,
    data: {
      userId: user.id,
      name: user.fullName,
      email: user.emailAddress
    }
  };

  res.status(HTTP_STATUS.OK).send(response);
};

export const updatePassword = async (req: Request, res: Response) => {

  const { userId, password } = req.body;

  const userRepository = handleGetRepository(UserEntity);
  const passwordResetTokenRepository = handleGetRepository(PasswordResetToken);

  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError(userNotFound);
  }

  const resetToken = await passwordResetTokenRepository.findOne({
    where: { user: { id: userId }, status: 'active' }
  });

  if (!resetToken) {
    throw new BadRequestError('No active password reset request found');
  }

  user.password = await BcryptHelper.hash(password);
  await userRepository.save(user);

  // Update the reset token status
  resetToken.status = 'used';
  resetToken.usedAt = new Date();
  await passwordResetTokenRepository.save(resetToken);

  logger.debug(`Password updated successfully for user: ${userId}`);

  const response = {
    success: true,
    message: 'Password reset successfully'
  };

  res.status(HTTP_STATUS.OK).send(response);
};
