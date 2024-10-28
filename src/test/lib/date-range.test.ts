import { getDateRange } from '../../lib';
import { TimeSpan } from '../../types/timespan';

describe('getDateRange', () => {
  const mockDate = new Date('2024-01-15T15:30:25.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should set start date to midnight and keep end date as current time', () => {
    const timeSpans: TimeSpan[] = ['today', 'last7days', 'last30days'];

    for (const timespan of timeSpans) {
      const range = getDateRange(timespan);
      expect(range?.start.getHours()).toBe(0);
      expect(range?.start.getMinutes()).toBe(0);
      expect(range?.start.getSeconds()).toBe(0);
      expect(range?.start.getMilliseconds()).toBe(0);

      expect(range?.end).toEqual(mockDate);
    }
  });
});
