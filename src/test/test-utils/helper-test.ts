import { BookEntity } from '../../entities';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { testBook, testUser } from './test-data';

export const createTestUser = async (factory: TestFactory) => {
  const response = await factory.app.post('/auth/signup').send(testUser);

  expect(response.status).toEqual(HTTP_STATUS.CREATED);
  return { user: response.body.data, password: testUser.password };
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
  const newBook = bookRepository.create({
    title: testBook.title,
    author: testBook.author,
    format: testBook.format,
    cover: testBook.cover,
    size: 1000,
    url: 'http://test-book.com',
    owner: { id: userId }
  });
  await bookRepository.save(newBook);
  return newBook;
};
