import { faker } from '@faker-js/faker';
import { BookEntity, BookFormat, ReadingGoal, ReadingLogEntity } from '../../src/entities';
import { ReadingLocation } from '../../src/entities/types';
import { JwtHelper, getCurrentWeekRange, getDayOfWeek, getSecondsBetweenDates } from '../../src/lib';
import { HTTP_STATUS } from '../../src/lib/responses';
import { JwtPayload } from '../../src/types';
import handleGetRepository from '../../src/utils/handleGetRepository';
import { TestFactory } from '../factory';
import { testUser } from './test-data';


type ReadingLogData = Pick<ReadingLogEntity, 'startTime' | 'endTime'> & {
  userId: string;
  bookId: string;
  startLocation: ReadingLocation
  endLocation: ReadingLocation
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
    id: faker.string.uuid(),
    title: faker.lorem.words({ min: 3, max: 8 }),
    author: faker.person.fullName(),
    format: BookFormat.EPUB,
    size: faker.number.int({ min: 500, max: 5000 }),
    url: url || faker.internet.url(),
    owner: { id: userId }
  });
};

export const createTestGoal = async (userId: string): Promise<ReadingGoal> => {
  const readingGoalRepository = handleGetRepository(ReadingGoal);
  return readingGoalRepository.save({
    goalInSeconds: 1800,
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
    startLocation: {
      cfi: log.startLocation.cfi,
      pages: {
        totalPages: log.startLocation.pages?.totalPages,
        currentPage: log.startLocation.pages?.currentPage,
      },
      href: log.startLocation.href,
      percentage: log.startLocation.percentage
    },
    endLocation: {
      cfi: log.endLocation.cfi,
      pages: {
        totalPages: log.endLocation.pages?.totalPages,
        currentPage: log.endLocation.pages?.currentPage,
      },
      href: log.endLocation.href,
      percentage: log.endLocation.percentage
    }

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
    const duration = getSecondsBetweenDates(log.startTime, log.endTime);
    streakMap.set(dateStr, (streakMap.get(dateStr) || 0) + duration);
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

  return streaks;
};

export const getDateXDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};
