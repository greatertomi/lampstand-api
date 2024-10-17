import { BookEntity, ReadingLogEntity } from '../../entities';
import { ReadingGoal } from '../../entities/ReadingGoalEntity';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { JwtPayload } from '../../types';
import handleGetRepository from '../../utils/handleGetRepository';
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

export const getTestAuthToken = async (user: JwtPayload) => {
  return JwtHelper.generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName
  });
};

export const createTestBook = async (userId: string): Promise<BookEntity> => {
  const bookRepository = handleGetRepository(BookEntity);
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

export const createTestGoal = async (userId: string): Promise<ReadingGoal> => {
  const readingGoalRepository = handleGetRepository(ReadingGoal);
  return readingGoalRepository.save({
    goalInMinutes: 30,
    reminderTime: '08:00',
    user: { id: userId }
  });
};

export const createTestReadingLog = async (
  userId: string,
  bookId: string,
  minutesRead: number,
  startTime: Date,
  currentTime: Date
): Promise<ReadingLogEntity> => {
  const readingLogRepository = handleGetRepository(ReadingLogEntity);
  return readingLogRepository.save({
    user: { id: userId },
    book: { id: bookId },
    startTime,
    currentTime,
    minutesRead
  });
};
