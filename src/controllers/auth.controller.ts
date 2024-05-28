
import { Request, Response } from 'express';
import handleGetRepository from '../utils/handleGetRepository';
import { UserEntity } from '../entities';
import BcryptHelper from '../lib/responses/constants';
import { HTTP_ERRORS } from '../lib/responses';

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

  const response = {
    message: 'User created',
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.emailAddress
    }
  };

  res.status(HTTP_ERRORS.CREATED).json(response);
};
