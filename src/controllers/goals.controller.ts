import { Response } from 'express';
import { validate } from 'class-validator';
import { ReadingGoal } from '../entities/ReadingGoalEntity';
import { CreateReadingGoal } from '../middleware/create-reading-goal';
import { IExtendedRequest } from '../types';
import HandleGetRepository from '../utils/handleGetRepository';

export const createReadingGoals = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const readingGoal = new CreateReadingGoal();

  const goalInMinutes = Number.parseInt(req.body.goalInMinutes, 10);
  if (Number.isNaN(goalInMinutes)) {
    res.status(400).json({ message: 'goalInMinutes must be a valid number' });
    return;
  }
  readingGoal.goalInMinutes = goalInMinutes;

  readingGoal.reminderTime = req.body.reminderTime;

  const errors = await validate(readingGoal);
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const readingGoalRepository = HandleGetRepository(ReadingGoal);
  const newReadingGoal = readingGoalRepository.create({
    userId,
    ...readingGoal
  });

  await readingGoalRepository.save(newReadingGoal);

  res.status(201).json(newReadingGoal);
};
