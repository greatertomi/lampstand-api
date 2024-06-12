import { Request, Response } from 'express';
import { UserEntity } from '../entities';
import { BcryptHelper, JwtHelper } from '../lib';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';
import { sendVerificationEmail } from '../services/sendemail';


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

  const token = JwtHelper.generateToken(newUser.id);

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


  const { userId } = JwtHelper.verifyToken(token);

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.update(user.id, { isEmailVerified: true });
  return res.status(HTTP_STATUS.OK).json({ message: 'Email verified successfully' });
};
