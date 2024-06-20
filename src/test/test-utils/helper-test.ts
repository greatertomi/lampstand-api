import { TestFactory } from '../factory';
import { HTTP_STATUS } from '../../lib/responses';
import { testUser } from './test-data';

export const createTestUser = async (factory: TestFactory) => {
  const response = await factory.app.post('/auth/signup').send(
    testUser,
  );

  expect(response.status).toEqual(HTTP_STATUS.CREATED);
  return { user: response.body.data, password: testUser.password };
};
