/* eslint-disable sonarjs/no-duplicate-string */
import { Response } from 'express';
import { UserEntity } from '../entities';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';
import { logger } from '../services';

export const getUserProfile = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  const userRepository = handleGetRepository(UserEntity);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { password, ...userResponse } = user;

  logger.info('User Profile retrieved successfully', {
    location: 'Get User Profile Controller'
  });

  return res.json(userResponse);
};

export const updateProfilePicture = async (req: IExtendedRequest, res: Response) => {
  const userRepository = handleGetRepository(UserEntity);
  const { id: userId } = req.user;

  const profilePictureUrl = req.uploadedFile.secure_url;
  const user = await userRepository.findOneBy({ id: userId });

  if (!user) {
    throw new NotFoundError('User not found');
  }
  await userRepository.update({ id: userId }, { profilePicture: profilePictureUrl });

  logger.info('Profile picture uploaded successfully', {
    location: 'Update Profile Picture Controller'
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Profile picture uploaded successfully',
    data: {
      profilePictureUrl
    }
  });
};

export const removeAccount = async (req: IExtendedRequest, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const userRepository = handleGetRepository(UserEntity);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ['books', 'readingGoals', 'readingLogs']
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await userRepository.remove(user);

  logger.info('User Account deleted successfully', {
    location: 'Remove Account Controller'
  });

  return res
    .status(HTTP_STATUS.OK)
    .json({ message: 'User and associated data successfully deleted' });
};
