import { logger } from '../services';
import { TimeSpan } from '../types/timespan';

const timeSpanOffsets: Record<TimeSpan, number> = {
  today: 0,
  last7days: 6,
  last30days: 29
};
export const getDateRange = (timespan: TimeSpan): { start: Date; end: Date } | null => {
  const offset = timeSpanOffsets[timespan];

  if (offset === undefined) {
    logger.warn(`Invalid timespan provided: ${timespan}`, { location: 'Get Date Range' });
    return null;
  }

  const end = new Date();
  const start = new Date();

  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);

  logger.info(`Generated date range for '${timespan}'`, { location: 'Get Date Range' });

  return { start, end };
};

export const getCurrentWeekRange = (date?: string | Date) => {
  const inputDate = date ? new Date(date) : new Date();

  const utcDate = new Date(
    Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate())
  );

  const dayOfWeek = utcDate.getUTCDay();
  const startOfWeek = new Date(utcDate);
  startOfWeek.setUTCDate(utcDate.getUTCDate() - dayOfWeek);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
};

export const getDayOfWeek = (date: Date): { long: string; short: string } => {
  const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  const dayIndex = date.getUTCDay();
  return {
    long: longDays[dayIndex],
    short: shortDays[dayIndex]
  };
};

export const getSecondsBetweenDates = (start: Date, end: Date): number => {
  return Math.round((end.getTime() - start.getTime()) / 1000);
};
