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
