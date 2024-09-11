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
    user: { id: userId },
    goalInMinutes,
    reminderTime
  });

  await readingGoalRepository.save(newReadingGoal);

  res.status(HTTP_STATUS.CREATED).json(newReadingGoal);
};

export const getReadingGoals = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const goals = await readingGoalRepository.find({
    where: { user: { id: userId } }
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goals retrieved successfully',
    data: goals
  });
};

export const updateReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const { id } = req.params;
  const { goalInMinutes, reminderTime } = req.body;

  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const existingGoal = await readingGoalRepository.findOne({
    where: { id, user: { id: userId } }
  });

  if (!existingGoal) {
    res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ error: 'Reading goal not found or you do not have permission to update it' });
    return;
  }

  const updateData: Partial<ReadingGoal> = {};

  if (goalInMinutes !== undefined) {
    updateData.goalInMinutes = goalInMinutes;
  }

  if (reminderTime !== undefined) {
    updateData.reminderTime = reminderTime;
  }

  await readingGoalRepository.update(id, updateData);

  const updatedGoal = await readingGoalRepository.findOne({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goal updated successfully',
    data: updatedGoal
  });
};
