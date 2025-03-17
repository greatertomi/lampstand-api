import { BookEntity, ReadingGoal, ReadingLogEntity } from '../../src/entities';
import { JwtHelper, getCurrentWeekRange, getDayOfWeek } from '../../src/lib';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import handleGetRepository from '../../src/utils/handleGetRepository';
import { TestFactory } from '../factory';
import { testBook, testUser } from './test-data';

type ReadingLogData = Pick<ReadingLogEntity, 'secondsRead' | 'startTime' | 'endTime'> & {
  userId: string;
  bookId: string;
};

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

export const createTestBook = async (userId: string, url?: string): Promise<BookEntity> => {
  const bookRepository = handleGetRepository(BookEntity);
  return bookRepository.save({
    id: testBook.id,
    title: testBook.title,
    author: testBook.author,
    format: testBook.format,
    cover: testBook.cover,
    size: 1000,
    url: url || 'http://test-book.com',
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

export const createTestReadingLogs = async (readingLogs: ReadingLogData[]) => {
  const readingLogRepository = handleGetRepository(ReadingLogEntity);
  const logsToSave = readingLogs.map((log) => ({
    user: { id: log.userId },
    book: { id: log.bookId },
    startTime: log.startTime,
    endTime: log.endTime,
    secondsRead: log.secondsRead
  }));
  return readingLogRepository.save(logsToSave);
};

export const createTestActivityStreaks = async (
  readingLogs: ReadingLogData[],
  userGoal: number
) => {
  const { start, end } = getCurrentWeekRange();
  const streakMap = new Map<string, number>();

  for (const log of readingLogs) {
    const dateStr = log.startTime.toISOString().split('T')[0];
    streakMap.set(dateStr, (streakMap.get(dateStr) || 0) + log.secondsRead);
  }

  const streaks = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = new Date(currentDate.toISOString().split('T')[0]).toISOString().split('T')[0];
    const loggedSeconds = streakMap.get(dateStr) || 0;
    const isCompleted = loggedSeconds >= userGoal;

    streaks.push({
      date: dateStr,
      completed: isCompleted,
      dayOfWeek: getDayOfWeek(currentDate)
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { streaks };
};
