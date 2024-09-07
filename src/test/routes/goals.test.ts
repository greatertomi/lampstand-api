import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

describe('[POST] /reading-goals', () => {
  const factory: TestFactory = new TestFactory();
  const readingGoalRoute = '/goals/create';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

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
