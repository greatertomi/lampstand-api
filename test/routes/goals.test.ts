/* eslint-disable sonarjs/no-duplicate-string */
import { ReadingGoal } from '../../src/entities/ReadingGoalEntity';
import { HTTP_STATUS } from '../../src/lib/responses';
import { TestFactory } from '../factory';
import { createTestGoal, createTestUser, getTestAuthToken } from '../test-utils/helper-test';

describe('Testing the goals route', () => {
  const factory: TestFactory = new TestFactory();
  const readingGoalRoute = '/goals/create';

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
        reminderTime: '19:00:00'
      };

      const res = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(newGoal)
        .expect(HTTP_STATUS.CREATED);

      expect(res.body).toEqual({
        message: 'Reading goal created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          goalInMinutes: newGoal.goalInMinutes,
          reminderTime: '19:00:00',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      });
    });

    it('should update a reading goal for a logged-in user', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const newGoal = {
        goalInMinutes: 30,
        reminderTime: '19:00:00'
      };

      await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(newGoal)
        .expect(HTTP_STATUS.CREATED);

      const updateGoal = {
        goalInMinutes: 50,
        reminderTime: '02:00:00'
      };

      const res = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(updateGoal)
        .expect(HTTP_STATUS.CREATED);

      expect(res.body).toEqual({
        message: 'Reading goal updated successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          goalInMinutes: updateGoal.goalInMinutes,
          reminderTime: '02:00:00',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
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

      const invalidGoal = { reminderTime: '19:00:00' };

      const res1 = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidGoal)
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(res1.body).toEqual({
        errors: [
          {
            field: 'goalInMinutes',
            message: 'goalInMinutes must be a positive integer'
          }
        ]
      });

      const invalidGoal2 = { goalInMinutes: 30 };
      const res2 = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidGoal2)
        .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

      expect(res2.body).toEqual({
        errors: [
          {
            field: 'reminderTime',
            message: 'reminderTime is required'
          },
          {
            field: 'reminderTime',
            message: 'reminderTime must be in HH:MM:SS format'
          }
        ]
      });
    });
  });

  describe('[GET] /goals', () => {
    const getGoalsRoute = '/goals/';
    const createGoalRoute = '/goals/create';

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(getGoalsRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should return user goal when authenticated', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const newGoal = await createTestGoal(user.id);

      const response = await factory.app.get(getGoalsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);

      expect(response.body).toMatchObject({
        message: 'Reading goal retrieved successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          goalInMinutes: newGoal.goalInMinutes,
          reminderTime: '08:00:00',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      });
    });

    it('should return an empty array when user has no goals', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app.get(getGoalsRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Reading goal retrieved successfully',
        data: null
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      jest
        .spyOn(factory._connection.getRepository(ReadingGoal), 'upsert')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .post(createGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalInMinutes: 30,
          reminderTime: '19:00:00'
        });

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'An unexpected error occurred: Database error'
        }
      ]);
    });
  });

  describe('[DELETE] /reading-goals/:id', () => {
    const deleteReadingGoalRoute = '/goals';

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.delete(`${deleteReadingGoalRoute}/123`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should delete the reading goal when authenticated and goal exists', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const newGoal = await createTestGoal(user.id);

      const deleteResponse = await factory.app
        .delete(`${deleteReadingGoalRoute}/${newGoal.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(HTTP_STATUS.OK);
      expect(deleteResponse.body).toMatchObject({
        message: 'Reading goal deleted successfully'
      });
    });

    it('should return 404 when reading goal does not exist', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const response = await factory.app
        .delete(`${deleteReadingGoalRoute}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.errors).toEqual([
        { message: 'Reading goal not found or you do not have permission to delete it' }
      ]);
    });

    it('should return 404 when a user attempts to delete a reading goal they did not create', async () => {
      const { user: firstUser } = await createTestUser(factory);
      await getTestAuthToken(firstUser);
      const newGoal = await createTestGoal(firstUser.id);

      const { user: secondUser } = await createTestUser(factory);
      const secondUserToken = await getTestAuthToken(secondUser);

      const deleteResponse = await factory.app
        .delete(`${deleteReadingGoalRoute}/${newGoal.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(deleteResponse.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(deleteResponse.body.errors).toEqual([
        { message: 'Reading goal not found or you do not have permission to delete it' }
      ]);
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      jest
        .spyOn(factory._connection.getRepository(ReadingGoal), 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .delete(`${deleteReadingGoalRoute}/123`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'An unexpected error occurred: Database error'
        }
      ]);
    });
  });
});
