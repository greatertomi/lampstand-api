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

export const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();

  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek));

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getUTCDay()];
};
