import { Request, Response } from 'express';
import { UserEntity } from '../entities';
import { BcryptHelper, verifyToken } from '../lib';
import { HTTP_STATUS } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';
import { sendVerificationEmail } from '../services/sendemail';
import { generateToken } from '../lib';
import { logger } from '../services';
export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password, agreedToTerms } = req.body;
  const hashedPassword = await BcryptHelper.hash(password);

  const userRepository = handleGetRepository(UserEntity);
  const newUser = userRepository.create({
    fullName,
    emailAddress: email,
    password: hashedPassword,
    agreedToTerms
  });

  await userRepository.save(newUser);

  const token = generateToken(newUser.id);

  await sendVerificationEmail(newUser.emailAddress, newUser.id);

  const response = {
    message: 'User created',
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.emailAddress,
      token,
    }

  };

  res.status(HTTP_STATUS.CREATED).json(response);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  try {
    const { userId } = verifyToken(token);

    const userRepository = handleGetRepository(UserEntity);

    const user = await userRepository.findOneBy({ id: userId });
    if (user) {
      user.isEmailVerified = true;
      await userRepository.save(user);
      return res.status(HTTP_STATUS.OK).json({ message: 'Email verified successfully' });
    }

    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
  } catch (error) {
    logger.error('Error verifying token:', error);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid token' });
  }
};
