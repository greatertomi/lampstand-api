import { Response } from 'express';
import { Between } from 'typeorm';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { ReadingGoal, ReadingLogEntity } from '../entities';
import { BadRequestError, HTTP_STATUS } from '../lib/responses';
import { IExtendedRequest } from '../types';
import { getCurrentWeekRange, getDayOfWeek, getSecondsBetweenDates } from '../utils';
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
    const duration = getSecondsBetweenDates(log.startTime, log.endTime);
    streakMap.set(dateStr, (streakMap.get(dateStr) || 0) + duration);
  }

  const streaks = [];
  const currentDate = new Date(dateRange.start);

  while (currentDate <= dateRange.end) {
    const dateStr = new Date(currentDate.toISOString().split('T')[0]).toISOString().split('T')[0];
    streaks.push({
      date: dateStr,
      completed: (streakMap.get(dateStr) || 0) >= dailyGoal,
      dayOfWeek: getDayOfWeek(currentDate).long
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(HTTP_STATUS.OK).json(streaks);
};

export const getCurrentStreaks = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user.id;

  const readingGoals = handleGetRepository(ReadingGoal);
  const readingGoal = await readingGoals.findOne({
    where: { user: { id: userId } },
    order: { createdAt: 'DESC' }
  });

  if (!readingGoal) {
    throw new BadRequestError('User does not have a reading goal set.');
  }

  const goalTime = readingGoal.goalInSeconds;

  const readingLogs = handleGetRepository(ReadingLogEntity);
  const readingLog = await readingLogs.find({
    where: { user: { id: userId } },
    order: { startTime: 'DESC' }
  });

  if (readingLog.length === 0) {
    throw new BadRequestError('User does not have any reading logs');
  }

  const readingByDate = new Map<string, number>();
  for (const log of readingLog) {
    const startDate = log.startTime.toISOString().split('T')[0];
    const duration = getSecondsBetweenDates(log.startTime, log.endTime);
    readingByDate.set(startDate, (readingByDate.get(startDate) || 0) + duration);
  }

  for (const [date, secondsRead] of readingByDate.entries()) {
    if (secondsRead < goalTime) {
      readingByDate.delete(date);
    }
  }
  const readingDates = [...readingByDate.keys()].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastReadDate = readingDates[0];

  // Streak breaks if the most recent reading day isn't today or yesterday
  if (lastReadDate !== today && lastReadDate !== yesterdayStr) {
    return res.status(HTTP_STATUS.OK).json({
      count: 0,
      startDate: null,
      lastReadDate
    });
  }

  // Calculate streak by checking consecutive days
  let streakCount = 1;
  let currentDate = new Date(lastReadDate);
  let startDate = lastReadDate;

  for (let i = 1; i < readingDates.length; i++) {
    const expectedPreviousDate = new Date(currentDate);
    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);
    const expectedPreviousDateStr = expectedPreviousDate.toISOString().split('T')[0];

    if (readingDates[i] === expectedPreviousDateStr) {
      streakCount++;
      startDate = readingDates[i];
      currentDate = expectedPreviousDate;
    } else {
      break;
    }
  }

  res.status(HTTP_STATUS.OK).json({ count: streakCount, startDate, lastReadDate });
};

export const getWeeklyReadingActivities = async (req: IExtendedRequest, res: Response) => {
  const { date } = req.query;
  const userId = req.user.id;

  let weekRange: { start: Date; end: Date };

  const readingLogs = handleGetRepository(ReadingLogEntity);

  const readingDuration = new Map<string, number>();

  if (date) {
    const inputDate = new Date(date as string);
    weekRange = getCurrentWeekRange(inputDate);
  } else {
    weekRange = getCurrentWeekRange();
  }
  const readingLog = await readingLogs.find({
    where: {
      user: { id: userId },
      startTime: Between(weekRange.start, weekRange.end)
    }
  });

  const weeklyData = [];
  const currentDate = new Date(weekRange.start);

  for (const log of readingLog) {
    let currentStart = new Date(log.startTime);
    const endTime = new Date(log.endTime);

    while (currentStart < endTime) {
      const endOfTheDay = new Date(currentStart);
      endOfTheDay.setHours(23, 59, 59, 999);

      const segmentEnd = endTime < endOfTheDay ? endTime : endOfTheDay;
      const duration = getSecondsBetweenDates(currentStart, segmentEnd);
      const dateStr = currentStart.toISOString().split('T')[0];
      readingDuration.set(dateStr, (readingDuration.get(dateStr) || 0) + duration);

      currentStart = new Date(segmentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
      currentStart.setHours(0, 0, 0, 0);
    }
  }

  while (currentDate <= weekRange.end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    weeklyData.push({
      secondsRead: readingDuration.get(dateStr) || 0,
      label: getDayOfWeek(currentDate).short,
      date: dateStr
    });
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  res.status(HTTP_STATUS.OK).json(weeklyData);
};

export const getDailyReadingActivityData = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user.id;
  const { date } = req.query;
  const selectedDate = parseISO((date as string) ?? new Date().toISOString().split('T')[0]);

  const splitReadSecondsIntoHour = (readingLogs: ReadingLogEntity[]) => {
    const hourlyReadings = Array.from({ length: 24 }, (_, hour) => ({
      secondsRead: 0,
      label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour < 12 ? 'am' : 'pm'}`
    }));

    for (const log of readingLogs) {
      const startTime = new Date(log.startTime);
      const endTime = new Date(log.endTime);

      const totalTimeSpanInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
      if (totalTimeSpanInSeconds <= 0) continue;

      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const currentHour = currentTime.getUTCHours();
        const nextHourTime = new Date(currentTime);
        nextHourTime.setUTCHours(currentHour + 1, 0, 0, 0);

        const timeUntilNextHour = Math.min(endTime.getTime(), nextHourTime.getTime());
        const secondsInThisHour = (timeUntilNextHour - currentTime.getTime()) / 1000;

        hourlyReadings[currentHour].secondsRead += Math.round(secondsInThisHour);

        currentTime = new Date(timeUntilNextHour);
      }
    }

    return hourlyReadings;
  };

  const readingLogRepository = handleGetRepository(ReadingLogEntity);
  const selectedDateReadingLogs = await readingLogRepository.find({
    where: {
      user: { id: userId },
      startTime: Between(startOfDay(selectedDate), endOfDay(selectedDate)),
      endTime: Between(startOfDay(selectedDate), endOfDay(selectedDate))
    }
  });

  res.json(splitReadSecondsIntoHour(selectedDateReadingLogs));
};

export const getReadingSummaryData = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;
  const { date, startDate, endDate } = req.query;

  let dateRange: { start: Date; end: Date };
  if (date) {
    const parsedDate = new Date(date as string);
    dateRange = {
      start: new Date(parsedDate.setHours(0, 0, 0, 0)),
      end: new Date(parsedDate.setHours(23, 59, 59, 999))
    };
  } else if (startDate && endDate) {
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);
    dateRange = {
      start: new Date(parsedStartDate.setHours(0, 0, 0, 0)),
      end: new Date(parsedEndDate.setHours(23, 59, 59, 999))
    };
  }

  const readingLogsEntity = handleGetRepository(ReadingLogEntity);
  const readingLogs = await readingLogsEntity.find({
    where: { startTime: Between(dateRange.start, dateRange.end), user: { id: userId } }
  });

  let totalSeconds = 0;

  for (const log of readingLogs) {
    const start = log.startTime < dateRange.start ? dateRange.start : log.startTime;
    const end = log.endTime > dateRange.end ? dateRange.end : log.endTime;

    totalSeconds += getSecondsBetweenDates(start, end);
  }

  const timeDiff = dateRange.end.getTime() - dateRange.start.getTime();
  const daysInRange = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const averageSecondsPerDay = daysInRange > 0 ? Math.round(totalSeconds / daysInRange) : 0;

  const response = {
    totalHoursReading: totalSeconds,
    averageHoursSpent: averageSecondsPerDay,
    daysInRange
  };

  res.status(HTTP_STATUS.OK).json(response);
};
