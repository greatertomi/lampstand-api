import {
  getCurrentWeekRange,
  getDateRange,
  getDayOfWeek,
  getSecondsBetweenDates
} from '../../src/lib';
import { TimeSpan } from '../../src/types/timespan';

describe('getDateRange', () => {
  const mockDate = new Date('2024-01-15T15:30:25.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should set start date to midnight and keep end date as end time', () => {
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

describe('Date Utility Functions', () => {
  const mockDate = new Date('2025-03-19T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCurrentWeekRange', () => {
    it('should return correct start and end of the current week', () => {
      const { start, end } = getCurrentWeekRange();

      expect(start.getUTCDay()).toBe(0);
      expect(start.getUTCHours()).toBe(0);
      expect(start.getUTCMinutes()).toBe(0);
      expect(start.getUTCSeconds()).toBe(0);
      expect(start.getUTCMilliseconds()).toBe(0);

      expect(end.getUTCDay()).toBe(6);
      expect(end.getUTCHours()).toBe(23);
      expect(end.getUTCMinutes()).toBe(59);
      expect(end.getUTCSeconds()).toBe(59);
      expect(end.getUTCMilliseconds()).toBe(999);
    });

    it('should correctly calculate the start and end of the week for date', () => {
      jest.setSystemTime(new Date('2025-03-21T12:00:00.000Z'));

      const { start, end } = getCurrentWeekRange();

      expect(start.toISOString().split('T')[0]).toBe('2025-03-16');

      expect(end.toISOString().split('T')[0]).toBe('2025-03-22');
    });

    it('should calculate the start and end of the week for a provided date', () => {
      const date = '2024-12-25';
      const { start, end } = getCurrentWeekRange(date);

      expect(start.toISOString().split('T')[0]).toBe('2024-12-22');

      expect(end.toISOString().split('T')[0]).toBe('2024-12-28');
    });

    it('should return null', () => {
      const date = 'not-a-date';
      const { start, end } = getCurrentWeekRange(date);

      expect(start).toBeNull();
      expect(end).toBeNull();
    });
  });

  describe('getDayOfWeek', () => {
    it('should return the correct long day of the week for given dates', () => {
      const days = [
        { date: '2025-03-16', expected: 'Sunday' },
        { date: '2025-03-17', expected: 'Monday' },
        { date: '2025-03-18', expected: 'Tuesday' },
        { date: '2025-03-19', expected: 'Wednesday' },
        { date: '2025-03-20', expected: 'Thursday' },
        { date: '2025-03-21', expected: 'Friday' },
        { date: '2025-03-22', expected: 'Saturday' }
      ];

      for (const { date, expected } of days) {
        expect(getDayOfWeek(new Date(`${date}T00:00:00.000Z`)).long).toBe(expected);
      }
    });

    it('should return the correct short day of the week for given dates', () => {
      const days = [
        { date: '2025-03-23', expected: 'Sun' },
        { date: '2025-03-24', expected: 'Mon' },
        { date: '2025-03-25', expected: 'Tue' },
        { date: '2025-03-26', expected: 'Wed' },
        { date: '2025-03-27', expected: 'Thur' },
        { date: '2025-03-28', expected: 'Fri' },
        { date: '2025-03-29', expected: 'Sat' }
      ];

      for (const { date, expected } of days) {
        expect(getDayOfWeek(new Date(`${date}T00:00:00.000Z`)).short).toBe(expected);
      }
    });
  });
  describe('getSecondsBetweenDates', () => {
    it('should return 0 when dates are the same', () => {
      const date = new Date('2025-05-22T12:00:00Z');
      expect(getSecondsBetweenDates(date, date)).toBe(0);
    });

    it('should return secondsRead of the given dates', () => {
      const start = new Date('2025-05-20T12:00:00Z');
      const end = new Date('2025-05-20T12:30:00Z');
      expect(getSecondsBetweenDates(start, end)).toBe(1800);
    });
  });
});
