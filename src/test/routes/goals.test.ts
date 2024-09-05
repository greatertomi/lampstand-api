import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

describe('[POST] /reading-goals', () => {
  const factory: TestFactory = new TestFactory();
  const readingGoalRoute = '/goals/reading-book';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
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
      userId: user.id,
      goalInMinutes: newGoal.goalInMinutes,
      reminderTime: newGoal.reminderTime,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('should return 400 if goalInMinutes is missing', async () => {
    const { user } = await createTestUser(factory);
    const token = await getTestAuthToken(user);

    const invalidGoal = {
      reminderTime: '19:00'
    };

    const res = await factory.app
      .post(readingGoalRoute)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidGoal)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(res.body).toEqual({
      message: 'goalInMinutes must be a valid number'
    });
  });

  it('should return 400 if reminderTime is missing', async () => {
    const { user } = await createTestUser(factory);
    const token = await getTestAuthToken(user);

    const invalidGoal = {
      goalInMinutes: 30
    };

    const res = await factory.app
      .post(readingGoalRoute)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidGoal)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(res.body).toEqual({
      errors: [
        {
          children: [],
          constraints: {
            isString: 'reminderTime must be a string',
            matches: 'reminderTime must be in HH:MM format'
          },
          property: 'reminderTime',
          target: {
            goalInMinutes: 30
          }
        }
      ]
    });
  });

  it('should accept reminderTime in HH:MM format', async () => {
    const { user } = await createTestUser(factory);
    const token = await getTestAuthToken(user);

    const validGoal = {
      goalInMinutes: 30,
      reminderTime: '19:00'
    };

    const res = await factory.app
      .post(readingGoalRoute)
      .set('Authorization', `Bearer ${token}`)
      .send(validGoal)
      .expect(HTTP_STATUS.CREATED);

    expect(res.body).toMatchObject({
      goalInMinutes: validGoal.goalInMinutes,
      reminderTime: validGoal.reminderTime
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
});
