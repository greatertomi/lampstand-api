/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookEntity, BookFormat } from '../../src/entities';
import { JwtPayload } from '../../src/types';

export const testUser = {
  fullName: 'David Brown',
  email: 'davidbrown@gmail.com',
  password: 'Str0ngP@ssw0rd!',
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
      minutesRead: 60,
      startTime: now,
      endTime: now
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 86_400_000),
      endTime: new Date(now.getTime() - 86_400_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 432_000_000),
      endTime: new Date(now.getTime() - 432_000_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 691_200_000),
      endTime: new Date(now.getTime() - 691_200_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 2_505_600_000),
      endTime: new Date(now.getTime() - 2_505_600_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 45,
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
