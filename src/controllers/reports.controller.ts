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

  const dailyGoal = userGoal.goalInSeconds;

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

export const getCurrentStreaks = async (req: IExtendedRequest, res: Response) => {
  const userId = req?.user.id;
  const readingGoal = handleGetRepository(ReadingGoal);
  const userGoal = await readingGoal.findOne({
    where: { user: { id: userId } },
    order: { createdAt: 'DESC' }
  });

  if (!userGoal) {
    throw new BadRequestError('User does not have a reading goal set.');
  }
  const dailyGoal = userGoal.goalInSeconds;

  const readingLogs = handleGetRepository(ReadingLogEntity);
  const readinglog = await readingLogs.find({ where: { user: { id: userId } } });

  if (readinglog.length === 0) {
    throw new BadRequestError('User does not have any reading Logs');
  }

  const streakMap = new Map();
  for (const log of readinglog) {
    const startDate = log.startTime.toISOString().split('T')[0];
    streakMap.set(startDate, (streakMap.get(startDate) || 0) + log.secondsRead);
  }
  for (const [date, secondsRead] of streakMap.entries()) {
    if (secondsRead < dailyGoal) {
      streakMap.delete(date);
    }
  }

  const streaksDate = [...streakMap.keys()].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (streaksDate.length === 0) {
    return res.status(HTTP_STATUS.OK).json({
      count: 0,
      startDate: null,
      lastReadDate: null
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastReadDate = streaksDate[0];
  if (lastReadDate !== today && lastReadDate !== yesterdayStr) {
    return res.status(HTTP_STATUS.OK).json({ count: 0, startDate: null, lastReadDate });
  }

  let streaksCount = 1;
  let startDate = lastReadDate;

  for (let i = 1; i < streaksDate.length; i++) {
    const currentDate = new Date(streaksDate[i]);
    const previousDate = new Date(streaksDate[i - 1]);
    previousDate.setDate(previousDate.getDate() - 1);

    if (currentDate.getTime() === previousDate.getTime()) {
      streaksCount++;
      startDate = streaksDate[i];
    } else {
      break;
    }
  }

  res.status(HTTP_STATUS.OK).json({ count: streaksCount, startDate, lastReadDate });
};
