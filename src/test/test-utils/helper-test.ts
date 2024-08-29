import { faker } from '@faker-js/faker';
import { BookEntity, BookFormat } from '../../entities';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { JwtPayload } from '../../types';
import handleGetRepository from '../../utils/handleGetRepository';
import { TestFactory } from '../factory';

export const createTestUser = async (factory: TestFactory) => {
  const testUserData = {
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'Str0ngP@ssw0rd!',
    agreedToTerms: true
  };

  const response = await factory.app.post('/auth/signup').send(testUserData);
  expect(response.status).toEqual(HTTP_STATUS.CREATED);
  return { user: response.body.data, password: testUserData.password };
};

export const getTestAuthToken = async (user: JwtPayload) => {
  return JwtHelper.generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName
  });
};

export const createTestBook = async (userId: string): Promise<BookEntity> => {
  const bookRepository = handleGetRepository(BookEntity);

  const randomBook = {
    title: faker.lorem.words(3),
    author: faker.person.fullName(),
    cover: faker.image.url(),
    format: faker.helpers.arrayElement(Object.values(BookFormat)),
    size: faker.number.int({ min: 100, max: 5000 }),
    url: faker.internet.url(),
    owner: { id: userId }
  };
  return bookRepository.save(randomBook);
};
