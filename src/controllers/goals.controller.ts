import { Response } from 'express';

import { ReadingGoal } from '../entities/ReadingGoalEntity';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
import { IExtendedRequest } from '../types';
import handleGetRepository from '../utils/handleGetRepository';

export const createReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  const { goalInMinutes, reminderTime } = req.body;
  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const existingGoal = await readingGoalRepository.findOne({
    where: { user: { id: userId } }
  });

  await readingGoalRepository.upsert(
    {
      user: { id: userId },
      goalInMinutes,
      reminderTime
    },
    {
      conflictPaths: ['user'],
      skipUpdateIfNoValuesChanged: true
    }
  );

  const newGoal = await readingGoalRepository.findOne({
    where: { user: { id: userId } }
  });

  res.status(HTTP_STATUS.CREATED).json({
    message: `${
      existingGoal ? 'Reading goal updated successfully' : 'Reading goal created successfully'
    }`,
    data: newGoal
  });
};

export const getReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const goal = await readingGoalRepository.findOne({
    where: { user: { id: userId } }
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goal retrieved successfully',
    data: goal
  });
};

export const deleteReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const readingGoal = await readingGoalRepository.findOne({
    where: { id: req.params.id, user: { id: req.user.id } }
  });

  if (!readingGoal) {
    throw new NotFoundError('Reading goal not found or you do not have permission to delete it');
  }

  await readingGoalRepository.delete(readingGoal.id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goal deleted successfully'
  });
};
