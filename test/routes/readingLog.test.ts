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
        endTime: new Date().toISOString(),
        startLocation: {
          cfi: 'epubcfi(/6/40)',
          pages: { totalPages: 300, currentPage: 70 },
          href: '/chapter-9.xhtml',
          percentage: 0.23
        },
        endLocation: {
          cfi: 'epubcfi(/6/48)',
          pages: { totalPages: 300, currentPage: 78 },
          href: '/chapter-9.xhtml',
          percentage: 0.26
        }

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
        startLocation: {
          cfi: expect.any(String),
          pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
          href: expect.any(String),
          percentage: expect.any(Number)
        },
        endLocation: {
          cfi: expect.any(String),
          pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
          href: expect.any(String),
          percentage: expect.any(Number)
        }
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
        endTime: new Date(Date.now() - 3_600_000).toISOString(),
        startLocation: {
          cfi: 'epubcfi(/6/30)',
          pages: { totalPages: 300, currentPage: 70 },
          href: '/chapter-1.xhtml',
          percentage: 0.16
        },
        endLocation: {
          cfi: 'epubcfi(/6/38)',
          pages: { totalPages: 300, currentPage: 78 },
          href: '/chapter-3.xhtml',
          percentage: 0.21
        }
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
        endTime: new Date().toISOString(),
        startLocation: {
          cfi: 'epubcfi(/6/20)',
          pages: { totalPages: 300, currentPage: 70 },
          href: '/chapter-16.xhtml',
          percentage: 0.53
        },
        endLocation: {
          cfi: 'epubcfi(/6/23)',
          pages: { totalPages: 300, currentPage: 78 },
          href: '/chapter-19.xhtml',
          percentage: 0.66
        }
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
        endTime: new Date().toISOString(),
        startLocation: {
          cfi: 'epubcfi(/6/70)',
          pages: { totalPages: 320, currentPage: 25 },
          href: '/chapter-6.xhtml',
          percentage: 0.21
        },
        endLocation: {
          cfi: 'epubcfi(/6/88)',
          pages: { totalPages: 320, currentPage: 43 },
          href: '/chapter-7.xhtml',
          percentage: 0.26
        }
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
            startLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            },
            endLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            }
          })
        ])
      });
      expect(response.body.data.length).toBe(6);
    });
    it('should get reading logs for today', async () => {
      const today = new Date().toISOString().slice(0, 10);
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
            id: expect.any(String),
            bookId: book.id,
            bookTitle: expect.any(String),
            startTime: expect.any(String),
            endTime: expect.any(String),
            startLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            },
            endLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            }
          })
        ])
      });
      for (const log of response.body.data) {
        expect(log.startTime.slice(0, 10)).toBe(today);
        expect(log.endTime.slice(0, 10)).toBe(today);
      }
      expect(response.body.data.length).toBe(1);
    });
    it('should get reading logs for last 7 days', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=last7days`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.message).toBe('Reading logs fetched successfully');
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            bookId: book.id,
            bookTitle: expect.any(String),
            startTime: expect.any(String),
            endTime: expect.any(String),
            startLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            },
            endLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            }
          })
        ])
      );
      expect(response.body.data.length).toBe(3);
    });

    it('should get reading logs for last 30 days', async () => {
      const readingLogs = getMockedReadingLogs(user, book);
      await createTestReadingLogs(readingLogs);

      const response = await factory.app
        .get(`${getReadingLogsRoute}?timespan=last30days`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.message).toBe('Reading logs fetched successfully');
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            bookId: book.id,
            bookTitle: expect.any(String),
            startTime: expect.any(String),
            endTime: expect.any(String),
            startLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            },
            endLocation: {
              cfi: expect.any(String),
              pages: { totalPages: expect.any(Number), currentPage: expect.any(Number) },
              href: expect.any(String),
              percentage: expect.any(Number)
            }
          })
        ])
      );
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
