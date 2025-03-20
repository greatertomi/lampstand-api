import { Response } from 'express';
import { Between } from 'typeorm';
import { ReadingGoal, ReadingLogEntity } from '../entities';
import { BadRequestError, HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types';
import { getCurrentWeekRange, getDayOfWeek } from '../utils';
import handleGetRepository from '../utils/handleGetRepository';

export const getActivityStreaks = async (req: IExtendedRequest, res: Response): Promise<void> => {
  const { currentWeek, startDate, endDate } = req.query;
  const userId = req.user?.id;

  let dateRange: { start: Date; end: Date };

  if (currentWeek === 'true') {
    dateRange = getCurrentWeekRange();
  } else if (startDate && endDate) {
    dateRange = {
      start: new Date(new Date(startDate as string).toISOString()),
      end: new Date(
        new Date(endDate as string).toISOString().replace('T00:00:00.000Z', 'T23:59:59.999Z')
      )
    };
  } else {
    throw new BadRequestError('Either currentWeek or startDate and endDate must be provided.');
  }

  const readingGoals = handleGetRepository(ReadingGoal);
  const userGoal = await readingGoals.findOne({
    where: { user: { id: userId } },
    order: { createdAt: 'DESC' }
  });
  if (!userGoal) {
    throw new BadRequestError('User does not have a reading goal set.');
  }

  const dailyGoal = userGoal.goalInMinutes * 60;

  const readingLogs = handleGetRepository(ReadingLogEntity);
  const userLogs = await readingLogs.find({
    where: {
      user: { id: userId },
      startTime: Between(dateRange.start, dateRange.end)
    }
  });
  const streakMap = new Map();

  for (const log of userLogs) {
    const dateStr = log.startTime.toISOString().split('T')[0];
    streakMap.set(dateStr, (streakMap.get(dateStr) || 0) + log.secondsRead);
  }

  const streaks = [];
  const currentDate = new Date(dateRange.start);

  while (currentDate <= dateRange.end) {
    const dateStr = new Date(currentDate.toISOString().split('T')[0]).toISOString().split('T')[0];
    streaks.push({
      date: dateStr,
      completed: (streakMap.get(dateStr) || 0) >= dailyGoal,
      dayOfWeek: getDayOfWeek(currentDate)
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(HTTP_STATUS.OK).json(streaks);
};
