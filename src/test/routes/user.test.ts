import { HTTP_STATUS } from '../../lib/responses';
import { JwtPayload } from '../../types';
import { TestFactory } from '../factory';
import { createTestUser, getTestAuthToken } from '../test-utils/helper-test';

describe('[GET] users/me', () => {
  const factory: TestFactory = new TestFactory();
  const meRoute = '/users/me';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });

  it('should return the logged-in user information', async () => {
    const { user } = await createTestUser(factory);
    const token = await getTestAuthToken(user);

    const res = await factory.app
      .get(meRoute)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      fullName: expect.any(String),
      emailAddress: expect.any(String),
      phoneNumber: null,
      agreedToTerms: expect.any(Boolean),
      isEmailVerified: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });

    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 404 with error message when fetching a non-existent user', async () => {
    const nonExistentUser: JwtPayload = {
      id: '4f4ef67c-75fa-4490-bf02-b2429ccb4084',
      email: 'nonexistent@example.com',
      fullName: 'Non Existent User'
    };
    const token = await getTestAuthToken(nonExistentUser);

    const res = await factory.app
      .get(meRoute)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.NOT_FOUND);
    expect(res.body).toEqual({
      errors: [
        {
          message: 'User not found'
        }
      ]
    });
  });

  it('should return 401 if the user is not authenticated', async () => {
    const res = await factory.app.get(meRoute).expect(HTTP_STATUS.UNAUTHORIZED);

    expect(res.body).toEqual({
      errors: [
        {
          message: 'Authorization header not provided'
        }
      ]
    });
  });
});
