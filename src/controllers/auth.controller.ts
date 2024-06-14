import { Request, Response } from 'express';
import { UserEntity } from '../entities';
import { BcryptHelper, JwtHelper } from '../lib';
import { BadRequestError, HTTP_STATUS, NotFoundError } from '../lib/responses';
import { sendVerificationEmail } from '../services/sendemail';
import handleGetRepository from '../utils/handleGetRepository';

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
    throw new NotFoundError('User not found');
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

  const checkPassword = await BcryptHelper.compare(password, user.password);
  if (!checkPassword) {throw new BadRequestError('wrong password');}


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
