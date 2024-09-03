import { Response } from 'express';
import { UserEntity } from '../entities';
import { NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import HandleGetRepository from '../utils/handleGetRepository';

export const getUserProfile = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  const userRepository = HandleGetRepository(UserEntity);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { password, ...userResponse } = user;

  return res.json(userResponse);
};
