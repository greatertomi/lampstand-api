import { BookEntity } from '../../src/entities';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import { TestFactory } from '../factory';
import {
  createTestActivityStreaks,
  createTestBook,
  createTestGoal,
  createTestReadingLogs,
  createTestUser,
  getDateXDaysAgo,
  getTestAuthToken
} from '../test-utils/helper-test';
import { getCurrentDateReadingLogs, getCurrentWeekReadingLogs, pastReadingLogs } from '../test-utils/test-data';

const reportsRoute = '/reports/activity-streaks';
const currentRoute = '/reports/current-streaks';

describe('Testing the reading log route', () => {
  const factory: TestFactory = new TestFactory();
  let user: JwtPayload, token: string, book: BookEntity;

  beforeEach(async () => {
    await factory.init();
    const { user: current } = await createTestUser(factory);
    user = current;
    token = await getTestAuthToken(user);
    book = await createTestBook(user.id);
  });

  afterEach(async () => {
    await factory.close();
  });

  describe('GET /reports/activity-streaks', () => {
    it('should return streaks for the current week', async () => {
      const readingGoal = await createTestGoal(user.id);
      const dailyGoal = readingGoal.goalInSeconds;
      const readingLogs = getCurrentWeekReadingLogs(user, book);
      await createTestActivityStreaks(readingLogs, dailyGoal);
      const response = await factory.app
        .get(reportsRoute)
        .set('Authorization', `Bearer ${token}`)
        .query({ currentWeek: 'true' });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(response.body)).toBe(true);
      for (const streak of response.body) {
        expect(streak).toHaveProperty('date');
        expect(streak).toHaveProperty('completed');
        expect(streak).toHaveProperty('dayOfWeek');
      }
    });

    it('should return streaks when startDate and endDate are provided', async () => {
      const readingGoal = await createTestGoal(user.id);
      const dailyGoal = readingGoal.goalInSeconds;
      const readingLogs = pastReadingLogs(user, book);
      await createTestActivityStreaks(readingLogs, dailyGoal);
      const response = await factory.app
        .get(reportsRoute)
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2025-01-04', endDate: '2025-01-09' });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(Array.isArray(response.body)).toBe(true);
      for (const streak of response.body) {
        expect(streak).toHaveProperty('date');
        expect(streak).toHaveProperty('completed');
        expect(streak).toHaveProperty('dayOfWeek');
      }
    });

    it('should return an error when no query parameters are given', async () => {
      const response = await factory.app.get(reportsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.errors).toContainEqual({
        message: 'Either currentWeek or startDate and endDate must be provided.'
      });
    });

    it('should return an error when date queries are invalid date formats ', async () => {
      const readingGoal = await createTestGoal(user.id);
      const dailyGoal = readingGoal.goalInSeconds;
      const readingLogs = pastReadingLogs(user, book);
      await createTestActivityStreaks(readingLogs, dailyGoal);
      const response = await factory.app
        .get(reportsRoute)
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2025-01-0', endDate: '2025-01-0' });

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            message: 'startDate must be a valid date in YYYY-MM-DD format.',
            field: 'startDate'
          },
          {
            message: 'endDate must be a valid date in YYYY-MM-DD format.',
            field: 'endDate'
          }
        ])
      );
    });

    it('should return an error if currentWeek is used with startDate/endDate', async () => {
      const readingGoal = await createTestGoal(user.id);
      const dailyGoal = readingGoal.goalInSeconds;
      const readingLogs = pastReadingLogs(user, book);
      await createTestActivityStreaks(readingLogs, dailyGoal);
      const response = await factory.app
        .get(reportsRoute)
        .set('Authorization', `Bearer ${token}`)
        .query({ currentWeek: 'true', startDate: '2024-03-01', endDate: '2024-03-03' });

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            message: 'Cannot use startDate with currentWeek.',
            field: 'startDate'
          },
          {
            message: 'Cannot use endDate with currentWeek.',
            field: 'endDate'
          }
        ])
      );
    });
  });

  describe('GET /reports/current-streaks', () => {
    it('should return streaks when the user reads today', async () => {
      await createTestGoal(user.id);
      const readingLogs = getCurrentDateReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);
      const response = await factory.app.get(currentRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);

      const todayStr = getDateXDaysAgo(0);
      const fiveDaysAgoStr = getDateXDaysAgo(4);
      expect(response.body).toMatchObject({
        count: 5,
        startDate: fiveDaysAgoStr,
        lastReadDate: todayStr
      });
    });

    it('should return no streak count when the last reading log is not from today', async () => {
      await createTestGoal(user.id);
      const readingLogs = getCurrentWeekReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);
      const response = await factory.app.get(currentRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        count: 0,
        startDate: null,
        lastReadDate: expect.any(String)
      });
    });

    it('should continue streak if the last read date is yesterday', async () => {
      await createTestGoal(user.id);
      const yesterdayStr = getDateXDaysAgo(1);
      const yesterday = new Date(yesterdayStr);

      const readingStartDate = new Date(
        Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 10, 0, 0)
      );
      const readingEndDate = new Date(
        Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 10, 30, 0)
      );

      const readingLogs = [
        {
          userId: user.id,
          bookId: book.id,
          date: yesterdayStr,
          secondsRead: Math.floor(Math.random() * (3600 - 1800 + 1) + 1800),
          startTime: readingStartDate,
          endTime: readingEndDate
        }
      ];
      await createTestReadingLogs(readingLogs);

      const response = await factory.app.get(currentRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        count: 1,
        startDate: yesterdayStr,
        lastReadDate: yesterdayStr
      });
    });

    it('should return 0 streaks if user has no reading logs', async () => {
      await createTestGoal(user.id);
      const response = await factory.app.get(currentRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.errors).toContainEqual({
        message: 'User does not have any reading logs'
      });
    });

    it('should return 0 streaks if user has no reading goal set', async () => {
      const response = await factory.app.get(currentRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.errors).toContainEqual({
        message: 'User does not have a reading goal set.'
      });
    });
  });
});
