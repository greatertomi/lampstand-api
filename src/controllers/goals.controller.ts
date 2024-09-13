import { Response } from 'express';
import { ReadingGoal } from '../entities/ReadingGoalEntity';
import { HTTP_STATUS, NotFoundError } from '../lib/responses';
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

export const deleteReadingGoal = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const goalId = req.params.id;

  const readingGoalRepository = handleGetRepository(ReadingGoal);

  const readingGoal = await readingGoalRepository.findOne({
    where: { id: goalId, user: { id: userId } }
  });

  if (!readingGoal) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Reading goal not found or you do not have permission to delete it'
    });
    return;
  }

  await readingGoalRepository.delete(readingGoal.id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goal deleted successfully'
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
    throw new NotFoundError('Reading goal not found or you do not have permission to update it');
  }

  await readingGoalRepository.update(id, {
    goalInMinutes,
    reminderTime
  });

  const updatedGoal = await readingGoalRepository.findOne({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    message: 'Reading goal updated successfully',
    data: updatedGoal
  });
};
