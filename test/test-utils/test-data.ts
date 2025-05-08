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
  cover: 'data:image/jpeg;base64,9j4j93'
};

export const getMockedReadingLogs = (user: JwtPayload, book: BookEntity) => {
  const now = new Date();
  return [
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 3600,
      startTime: now,
      endTime: now
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 1800,
      startTime: new Date(now.getTime() - 86_400_000),
      endTime: new Date(now.getTime() - 86_400_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 1800,
      startTime: new Date(now.getTime() - 432_000_000),
      endTime: new Date(now.getTime() - 432_000_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 1800,
      startTime: new Date(now.getTime() - 691_200_000),
      endTime: new Date(now.getTime() - 691_200_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 1800,
      startTime: new Date(now.getTime() - 2_505_600_000),
      endTime: new Date(now.getTime() - 2_505_600_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 2700,
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
      secondsRead: Math.floor(Math.random() * (3600 - 1800 + 1) + 1800),
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
      secondsRead: 900,
      startTime: new Date('2025-01-04T06:15:00.000Z'),
      endTime: new Date('2025-01-04T06:30:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 2700,
      startTime: new Date('2025-01-05T12:00:00.000Z'),
      endTime: new Date('2025-01-05T12:45:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 3600,
      startTime: new Date('2025-01-06T18:20:00.000Z'),
      endTime: new Date('2025-01-06T19:20:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 5400,
      startTime: new Date('2025-01-07T22:10:00.000Z'),
      endTime: new Date('2025-01-07T23:40:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 750,
      startTime: new Date('2025-01-08T09:05:15.000Z'),
      endTime: new Date('2025-01-08T09:17:45.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 4200,
      startTime: new Date('2025-01-09T14:50:00.000Z'),
      endTime: new Date('2025-01-09T16:00:00.000Z')
    },
    {
      userId: user.id,
      bookId: book.id,
      secondsRead: 3000,
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
      secondsRead: Math.floor(Math.random() * (3600 - 1800 + 1) + 1800),
      startTime: readingStartDate.toISOString(),
      endTime: readingEndDate.toISOString()
    });
  }

  return logs;
};
