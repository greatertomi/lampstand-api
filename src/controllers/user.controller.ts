import { Response } from 'express';
import { UserEntity } from '../entities';
import { HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types';
import HandleGetRepository from '../utils/handleGetRepository';

export const getUserProfile = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  const userRepository = HandleGetRepository(UserEntity);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
  }

  const { password, ...userResponse } = user;

  return res.json(userResponse);
};
