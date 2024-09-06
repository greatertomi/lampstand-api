import { Response } from 'express';
import { ReadingGoal } from '../entities/ReadingGoalEntity';
import { HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export const createReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { goalInMinutes, reminderTime } = req.body;

  const readingGoalRepository = handleGetRepository(ReadingGoal);
  const newReadingGoal = readingGoalRepository.create({
    user: req.user,
    goalInMinutes,
    reminderTime
  });

  await readingGoalRepository.save(newReadingGoal);
  const responseGoal = {
    ...newReadingGoal,
    userId: userId
  };

  res.status(HTTP_STATUS.CREATED).json(responseGoal);
};
