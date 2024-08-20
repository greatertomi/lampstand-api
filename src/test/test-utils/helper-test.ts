import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { testBook, testUser } from './test-data';

export const createTestUser = async (factory: TestFactory) => {
  const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  const testUserData = {
    ...testUser,
    email: uniqueEmail
  };
  const response = await factory.app.post('/auth/signup').send(testUserData);
  expect(response.status).toEqual(HTTP_STATUS.CREATED);
  return { user: response.body.data, password: testUserData.password };
};

export const getTestAuthToken = async (factory: TestFactory) => {
  const { user } = await createTestUser(factory);
  return {
    userId: user.id,
    token: JwtHelper.generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName
    })
  };
};

export const createTestBook = async (factory: TestFactory, userId: string): Promise<BookEntity> => {
  const bookRepository = factory._connection.getRepository(BookEntity);
  return bookRepository.save({
    title: testBook.title,
    author: testBook.author,
    format: testBook.format,
    cover: testBook.cover,
    size: 1000,
    url: 'http://test-book.com',
    owner: { id: userId }
  });
};
