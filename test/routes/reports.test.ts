import { BookEntity } from '../../src/entities';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import { TestFactory } from '../factory';
import {
  createTestActivityStreaks,
  createTestBook,
  createTestGoal,
  createTestUser,
  getTestAuthToken
} from '../test-utils/helper-test';
import { getCurrentWeekReadingLogs, pastReadingLogs } from '../test-utils/test-data';

const reportsRoute = '/reports/activity-streaks';

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

  describe('GET /reports/', () => {
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

    it('should return streaks for startTime and endTime is provided', async () => {
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
      const readingGoal = await createTestGoal(user.id);
      const dailyGoal = readingGoal.goalInSeconds;
      const readingLogs = pastReadingLogs(user, book);
      await createTestActivityStreaks(readingLogs, dailyGoal);
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
});
