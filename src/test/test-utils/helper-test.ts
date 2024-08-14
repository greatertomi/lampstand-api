import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { testUser } from './test-data';

export const createTestUser = async (factory: TestFactory) => {
  const response = await factory.app.post('/auth/signup').send(
    testUser,
  );

  expect(response.status).toEqual(HTTP_STATUS.CREATED);
  return { user: response.body.data, password: testUser.password };
};

export const getTestAuthToken = async (factory: TestFactory) => {
  const { user } = await createTestUser(factory);
  return JwtHelper.generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName
  });
};
