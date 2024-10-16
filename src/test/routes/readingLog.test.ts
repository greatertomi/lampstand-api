import { ReadingLogEntity } from '../../entities';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestBook, createTestUser, getTestAuthToken } from '../test-utils/helper-test';

const unAuthenticatedMessage = 'Authorization header not provided';

describe('Testing the reading log route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
  });

  describe('POST /readingLogs/create', () => {
    const logReadingRoute = '/readingLogs/create';

    it('should log reading event successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const book = await createTestBook(user.id);

      const readingLogData = {
        bookId: book.id,
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        currentTime: new Date().toISOString()
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
        currentTime: expect.any(String),
        minutesRead: expect.any(Number)
      });
    });

    it('should throw an error if reading log data is invalid', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const invalidReadingLogData = {
        bookId: 'invalid-uuid',
        startTime: 'invalid-date',
        currentTime: 'invalid-date'
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidReadingLogData);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        bookId: 'Invalid book ID',
        startTime: 'Invalid start time',
        currentTime: 'Current time must be after start time'
      });
    });

    it('should throw an error if current time is before start time', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const book = await createTestBook(user.id);

      const invalidReadingLogData = {
        bookId: book.id,
        startTime: new Date().toISOString(),
        currentTime: new Date(Date.now() - 3_600_000).toISOString()
      };

      const response = await factory.app
        .post(logReadingRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidReadingLogData);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        currentTime: 'Current time must be after start time'
      });
    });

    it('should throw an error if book does not exist', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const readingLogData = {
        bookId: '00000000-0000-0000-0000-000000000000',
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        currentTime: new Date().toISOString()
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
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const book = await createTestBook(user.id);

      const readingLogData = {
        bookId: book.id,
        startTime: new Date(Date.now() - 3_600_000).toISOString(),
        currentTime: new Date().toISOString()
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
});
