import { ReadingGoal } from '../../entities/ReadingGoalEntity';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

/* eslint-disable sonarjs/no-duplicate-string */

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
    const getGoalsRoute = '/goals/';

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(getGoalsRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should return user goals when authenticated', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const testGoal = { goalInMinutes: 30, reminderTime: '08:00' };

      const response1 = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send(testGoal);

      expect(response1.status).toBe(HTTP_STATUS.CREATED);

      const response2 = await factory.app
        .get(getGoalsRoute)
        .set('Authorization', `Bearer ${token}`);

      expect(response2.status).toBe(HTTP_STATUS.OK);
      expect(response2.body).toMatchObject({
        message: 'Reading goals retrieved successfully',
        data: [
          expect.objectContaining({
            ...testGoal,
            reminderTime: expect.stringMatching(/^08:00/),
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ]
      });

      expect(response2.body.data.length).toBe(1);
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

  describe('[PUT] /goals/update/:id', () => {
    it('should update a reading goal successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const newGoalResponse = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalInMinutes: 30,
          reminderTime: '08:00'
        });

      const newGoal = newGoalResponse.body;

      const updatedGoalData = {
        goalInMinutes: 60,
        reminderTime: '09:00'
      };

      const updateResponse = await factory.app
        .put(`/goals/update/${newGoal.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGoalData);

      expect(updateResponse.status).toBe(HTTP_STATUS.OK);

      const updatedGoal = updateResponse.body.data;
      expect(updatedGoal).toMatchObject({
        id: newGoal.id,
        goalInMinutes: updatedGoalData.goalInMinutes,
        reminderTime: expect.stringMatching(/^09:00(:00)?$/)
      });
    });

    it('should return a 404 error if the reading goal is not found', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const nonExistentGoalId = '4f4ef67c-75fa-4490-bf02-b2429ccb4084';

      const updateResponse = await factory.app
        .put(`/goals/update/${nonExistentGoalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ goalInMinutes: 45 });

      expect(updateResponse.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(updateResponse.body).toEqual({
        error: 'Reading goal not found or you do not have permission to update it'
      });
    });

    it('should return a 401 when no token is provided for updating a reading goal', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const newGoalResponse = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalInMinutes: 30,
          reminderTime: '08:00'
        });

      const testGoal = newGoalResponse.body;

      const updateData = {
        goalInMinutes: 30,
        reminderTime: '10:00'
      };

      const response = await factory.app.put(`/goals/update/${testGoal.id}`).send(updateData);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: 'Authorization header not provided'
          }
        ]
      });
    });

    it('should return a 422 error if the reading goal data is invalid', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const newGoalResponse = await factory.app
        .post(readingGoalRoute)
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalInMinutes: 30,
          reminderTime: '08:00'
        });

      const testGoal = newGoalResponse.body;

      const invalidGoalData = {
        goalInMinutes: 'not a number',
        reminderTime: 'invalid time'
      };

      const updateResponse = await factory.app
        .put(`/goals/update/${testGoal.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidGoalData);

      expect(updateResponse.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(updateResponse.body).toHaveProperty('errors');

      const errors = updateResponse.body.errors;

      const hasExpectedError =
        errors.goalInMinutes === 'goalInMinutes must be a positive integer' ||
        errors.reminderTime === 'reminderTime must be in HH:MM format';

      expect(hasExpectedError).toBe(true);
    });
  });
});
