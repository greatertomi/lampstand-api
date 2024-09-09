import { ReadingGoal } from '../../entities/ReadingGoalEntity';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

describe('Testing the goals route', () => {
  const factory: TestFactory = new TestFactory();
  const readingGoalRoute = '/goals/create';
  const getGoalsRoute = '/goals/';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });
  describe('[POST] /reading-goals', () => {
    it('should create a reading goal for a logged-in user', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const newGoal = {
        goalInMinutes: 30,
        reminderTime: '19:00'
      };

      const res = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(newGoal)
        .expect(HTTP_STATUS.CREATED);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        user: expect.objectContaining({ id: user.id }),
        goalInMinutes: newGoal.goalInMinutes,
        reminderTime: newGoal.reminderTime,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should return 401 if the user is not authenticated', async () => {
      const newGoal = {
        goalInMinutes: 30,
        reminderTime: '19:00'
      };

      const res = await factory.app
        .post(readingGoalRoute)
        .send(newGoal)
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(res.body).toEqual({
        errors: [
          {
            message: 'Authorization header not provided'
          }
        ]
      });
    });

    it('should return 400 if goalInMinutes or reminderTime is missing', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const invalidGoal = { reminderTime: '19:00' };

      const res1 = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidGoal)
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(res1.body).toEqual({
        errors: {
          goalInMinutes: 'goalInMinutes must be a positive integer'
        }
      });

      const invalidGoal2 = { goalInMinutes: 30 };
      const res2 = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidGoal2)
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(res2.body).toEqual({
        errors: {
          reminderTime: 'reminderTime must be in HH:MM format'
        }
      });
    });
  });

  describe('[GET] /goals', () => {
    const unAuthenticatedMessage = 'Authorization header not provided';

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(getGoalsRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: unAuthenticatedMessage }]
      });
    });

    it('should return user goals when authenticated', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const testGoal = { goalInMinutes: 30, reminderTime: '08:00:00' };

      const readingGoalRepository = factory._connection.getRepository(ReadingGoal);
      await readingGoalRepository.save({
        user: { id: user.id },
        ...testGoal
      });

      const response = await factory.app.get(getGoalsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading goals retrieved successfully',
        data: [
          expect.objectContaining({
            ...testGoal,
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ]
      });

      expect(response.body.data.length).toBe(1);
    });

    it('should return an empty array when user has no goals', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app.get(getGoalsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading goals retrieved successfully',
        data: []
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      jest
        .spyOn(factory._connection.getRepository(ReadingGoal), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(getGoalsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'Something went wrong'
        }
      ]);
    });
  });
});
