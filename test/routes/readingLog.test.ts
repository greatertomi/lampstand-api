/* eslint-disable sonarjs/no-duplicate-string */
import { BookEntity, ReadingLogEntity } from '../../src/entities';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import { TestFactory } from '../factory';
import {
  createTestBook,
  createTestReadingLogs,
  createTestUser,
  getTestAuthToken
} from '../test-utils/helper-test';
import { getMockedReadingLogs } from '../test-utils/test-data';

const unAuthenticatedMessage = 'Authorization header not provided';

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

  describe('POST /readingLogs/create', () => {
    const logReadingRoute = '/readingLogs/create';

    it('should log reading event successfully', async () => {
      const readingLogData = {
        bookId: book.id,
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        endTime: new Date().toISOString()
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(readingLogData);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty('message', 'Reading event logged successfully');
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        bookId: book.id,
        startTime: expect.any(String),
        endTime: expect.any(String),
        secondsRead: expect.any(Number)
      });
    });

    it('should throw an error if reading log data is invalid', async () => {
      const invalidReadingLogData = {
        bookId: 'invalid-uuid',
        startTime: 'invalid-date',
        endTime: 'invalid-date'
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidReadingLogData);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            field: 'bookId',
            message: 'Invalid book ID'
          },
          { field: 'startTime', message: 'Invalid start time' },
          {
            field: 'endTime',
            message: 'Invalid current time'
          },
          { field: 'endTime', message: 'End time must be after start time' }
        ])
      );
    });

    it('should throw an error if end time is before start time', async () => {
      const invalidReadingLogData = {
        bookId: book.id,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() - 3_600_000).toISOString()
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidReadingLogData);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            field: 'endTime',
            message: 'End time must be after start time'
          }
        ])
      );
    });

    it('should throw an error if book does not exist', async () => {
      const readingLogData = {
        bookId: '00000000-0000-0000-0000-000000000000',
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        endTime: new Date().toISOString()
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(readingLogData);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.errors).toMatchObject([
        {
          message: 'Book not found'
        }
      ]);
    });

    it('should throw an error if auth token is not provided', async () => {
      const response = await factory.app.post(logReadingRoute).send({});

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.errors).toMatchObject([
        {
          message: unAuthenticatedMessage
        }
      ]);
    });

    it('should return 500 when there is a server error', async () => {
      const readingLogData = {
        bookId: book.id,
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        endTime: new Date().toISOString()
      };

      jest
        .spyOn(factory._connection.getRepository(ReadingLogEntity), 'save')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(readingLogData);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'Something went wrong'
        }
      ]);
    });
  });

  describe('GET /readingLogs', () => {
    const getReadingLogsRoute = '/readingLogs/';
    it('should get all reading logs for a user successfully', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(getReadingLogsRoute)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading logs fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            bookId: book.id,
            bookTitle: expect.any(String),
            startTime: expect.any(String),
            endTime: expect.any(String),
            secondsRead: expect.any(Number)
          })
        ])
      });
      expect(response.body.data.length).toBe(6);
    });
    it('should get reading logs for today', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=today`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading logs fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            secondsRead: 3600
          })
        ])
      });
      expect(response.body.data.length).toBe(1);
    });
    it('should get reading logs for last 7 days', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=last7days`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading logs fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({ secondsRead: 3600 }),
          expect.objectContaining({ secondsRead: 1800 })
        ])
      });
      expect(response.body.data.length).toBe(3);
    });

    it('should get reading logs for last 30 days', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=last30days`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading logs fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({ secondsRead: 3600 }),
          expect.objectContaining({ secondsRead: 1800 })
        ])
      });
      expect(response.body.data.length).toBe(5);
    });

    it('should return empty array if no logs found', async () => {
      const response = await factory.app
        .get(getReadingLogsRoute)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.data).toHaveLength(0);
    });

    it('should throw an error if auth token is not provided', async () => {
      const response = await factory.app.get(getReadingLogsRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.errors).toMatchObject([
        {
          message: unAuthenticatedMessage
        }
      ]);
    });

    it('should return 422 if invalid timespan is provided', async () => {
      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=invalid`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          {
            field: 'timespan',
            message: 'Timespan must be one of: today, last7days, last30days'
          }
        ])
      );
    });

    it('should return 500 when there is a server error', async () => {
      jest
        .spyOn(factory._connection.getRepository(ReadingLogEntity), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .get(getReadingLogsRoute)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: 'Something went wrong'
          }
        ]
      });
    });
  });
});
