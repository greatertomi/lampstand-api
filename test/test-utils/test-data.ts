/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookEntity, BookFormat } from '../../src/entities';
import { JwtPayload } from '../../src/types';
import { getCurrentWeekRange } from '../../src/utils';

export const testUser = {
  fullName: 'David Brown',
  email: 'davidbrown@gmail.com',
  password: 'Str0ngP@ssw0rd!',
  confirmPassword: 'Str0ngP@ssw0rd!',
  agreedToTerms: true
};

export const testBook = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  title: 'Test Book',
  author: 'Test Author',
  format: BookFormat.PDF,
  cover: 'data:image/jpeg;base64,9j4j91'
};

export const createBackendbooks = (user: JwtPayload) => {
  return [
    {
      id: '3fa85f64-5717-4562-b3fc-2b963f66afa6',
      owner: user.id,
      title: 'Test Book One',
      author: 'Author One',
      format: BookFormat.PDF,
      cover: 'data:image/jpeg;base64,9j4j91',
      size: 1000,
      url: 'http://test-book.com'
    },
    {
      id: '6c39f54e-bb82-4ac5-8a4f-3b2c3f88f2a4',
      title: 'Test Book Two',
      owner: user.id,
      author: 'Author Two',
      format: BookFormat.PDF,
      cover: 'data:image/jpeg;base64,9j4j97',
      size: 1100,
      url: 'http://test2-book.com'
    },
    {
      id: '857ec110-21de-4b9f-9641-18f5ebfc171f',
      owner: user.id,
      title: 'Test Book Three',
      author: 'Author Three',
      format: BookFormat.PDF,
      cover: 'data:image/jpeg;base64,9j4j93',
      size: 1200,
      url: 'http://test1-book.com'
    },
    {
      id: 'd7f38b44-4c1f-4fd6-bc1f-4c2f6d59eb35',
      owner: user.id,
      title: 'Test Book Four',
      author: 'Author Four',
      format: BookFormat.PDF,
      cover: 'data:image/jpeg;base64,9j6j90',
      size: 1003,
      url: 'http://tester-book.com'
    },
    {
      id: '2e4e5bb3-1e0c-41b7-8c88-f0f8a6f6a8ff',
      owner: user.id,
      title: 'Test Book Five',
      author: 'Author Five',
      format: BookFormat.PDF,
      cover: 'data:image/jpeg;base64,9j9j93',
      size: 1020,
      url: 'http://tests-book.com'
    }
  ];
};

export const getMockedReadingLogs = (user: JwtPayload, book: BookEntity) => {
  const now = new Date();
  return [
    {
      userId: user.id,
      bookId: book.id,
      startTime: now,
      endTime: now
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 86_400_000),
      endTime: new Date(now.getTime() - 86_400_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 432_000_000),
      endTime: new Date(now.getTime() - 432_000_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 691_200_000),
      endTime: new Date(now.getTime() - 691_200_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 2_505_600_000),
      endTime: new Date(now.getTime() - 2_505_600_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 2_678_400_000),
      endTime: new Date(now.getTime() - 2_678_400_000)
    }
  ];
};

const testAuthor = 'Test Authors';
const coverImage = 'data:image/jpeg;base64,9j4j93';

export const testMultipleBooks = [
  {
    title: 'Test Book',
    author: testAuthor,
    format: BookFormat.EPUB,
    cover: coverImage
  },
  {
    title: 'Test Book: The Duology',
    author: testAuthor,
    format: BookFormat.EPUB,
    cover: coverImage
  }
];

export const mockBooksData = [
  {
    metadata: {
      title: 'Test Book',
      creator: testAuthor
    },
    manifest: [{ id: 'cover', href: 'cover.jpg', mediaType: 'image/jpeg' }],
    zipFile: {}
  },
  {
    metadata: {
      title: 'Test Book: The Duology',
      creator: testAuthor
    },
    manifest: [{ id: 'cover', href: 'cover.jpg', mediaType: 'image/jpeg' }],
    zipFile: {}
  }
];

export const getMockBookData = (bookData: (typeof mockBooksData)[number]) => {
  const metadata = bookData.metadata;

  return Promise.resolve({
    metadata: {
      title: metadata?.title || '',
      creator: metadata?.creator || ''
    },
    manifest: bookData.manifest,
    zipFile: bookData.zipFile
  });
};

export const extractMetadataValue = (property: any): string => {
  if (typeof property === 'string') {
    return property;
  }
  if (Array.isArray(property)) {
    return property
      .filter((item) => typeof item === 'object' && item.text)
      .map((item) => item.text)
      .join(' ');
  }
  return property.text || '';
};

export const getCurrentWeekReadingLogs = (user: JwtPayload, book: BookEntity) => {
  const { start } = getCurrentWeekRange();

  const logs = [];

  for (let i = 0; i < 7; i++) {
    const readingStartDate = new Date(start);
    readingStartDate.setDate(readingStartDate.getDate() + i);
    const readingEndDate = new Date(readingStartDate.getTime() + 3600 * 1000);

    logs.push({
      userId: user.id,
      bookId: book.id,
      startTime: readingStartDate,
      endTime: readingEndDate
    });
  }

  return logs;
};

export const pastReadingLogs = (user: JwtPayload, book: BookEntity) => {
  return [
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-04T06:15:00.000Z'),
      endTime: new Date('2025-01-04T06:30:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-05T12:00:00.000Z'),
      endTime: new Date('2025-01-05T12:45:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-06T18:20:00.000Z'),
      endTime: new Date('2025-01-06T19:20:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-07T22:10:00.000Z'),
      endTime: new Date('2025-01-07T23:40:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-08T09:05:15.000Z'),
      endTime: new Date('2025-01-08T09:17:45.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-09T14:50:00.000Z'),
      endTime: new Date('2025-01-09T16:00:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-10T23:30:00.000Z'),
      endTime: new Date('2025-01-11T00:20:00.000Z')
    }
  ];
};

export const getCurrentDateReadingLogs = (user, book) => {
  const logs = [];
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  for (let i = 4; i >= 0; i--) {
    const readingStartDate = new Date(now);
    readingStartDate.setUTCDate(now.getUTCDate() - i);
    const readingEndDate = new Date(readingStartDate.getTime() + 3600 * 1000);

    logs.push({
      userId: user.id,
      bookId: book.id,
      startTime: readingStartDate.toISOString(),
      endTime: readingEndDate.toISOString()
    });
  }

  return logs;
};
