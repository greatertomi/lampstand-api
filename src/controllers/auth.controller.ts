import { Request, Response } from 'express';
import { UserEntity } from '../entities';
import { BcryptHelper } from '../lib';
import { HTTP_STATUS } from '../lib/responses';
import handleGetRepository from '../utils/handleGetRepository';
import { generateToken } from '../lib';
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
  // Generate JWT token
  const token = generateToken(newUser.id);

  const response = {
    message: 'User created',
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.emailAddress,
      token
    }
  };

  res.status(HTTP_STATUS.CREATED).json(response);
};
