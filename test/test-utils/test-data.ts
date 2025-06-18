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

export const getMockedReadingLogs = (user: JwtPayload, book: BookEntity) => {
  const now = new Date();
  return [
    {
      userId: user.id,
      bookId: book.id,
      startTime: now,
      endTime: now,
      startLocation: {
        cfi: 'epubcfi(/6/44)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-21.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/48)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-25.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 86_400_000),
      endTime: new Date(now.getTime() - 86_400_000),
      startLocation: {
        cfi: 'epubcfi(/6/41)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-9.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/49)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-13.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 432_000_000),
      endTime: new Date(now.getTime() - 432_000_000),
      startLocation: {
        cfi: 'epubcfi(/6/42)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-31.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/50)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-32.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 691_200_000),
      endTime: new Date(now.getTime() - 691_200_000),
      startLocation: {
        cfi: 'epubcfi(/6/43)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-41.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/61)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-43.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 2_505_600_000),
      endTime: new Date(now.getTime() - 2_505_600_000),
      startLocation: {
        cfi: 'epubcfi(/6/45)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-2.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/52)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-4.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(now.getTime() - 2_678_400_000),
      endTime: new Date(now.getTime() - 2_678_400_000),
      startLocation: {
        cfi: 'epubcfi(/6/46)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-18.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/53)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-19.xhtml',
        percentage: 0.26
      }
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
      endTime: readingEndDate,
      startLocation: {
        cfi: 'epubcfi(/6/51)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-38.xhtml',
        percentage: 0.34
      },
      endLocation: {
        cfi: 'epubcfi(/6/55)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-39.xhtml',
        percentage: 0.35
      }
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
      endTime: new Date('2025-01-04T06:30:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/12)',
        pages: { totalPages: 300, currentPage: 42 },
        href: '/chapter-3.xhtml',
        percentage: 0.14
      },
      endLocation: {
        cfi: 'epubcfi(/6/14)',
        pages: { totalPages: 300, currentPage: 44 },
        href: '/chapter-3.xhtml',
        percentage: 0.15
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-05T12:00:00.000Z'),
      endTime: new Date('2025-01-05T12:45:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/20)',
        pages: { totalPages: 300, currentPage: 50 },
        href: '/chapter-5.xhtml',
        percentage: 0.17
      },
      endLocation: {
        cfi: 'epubcfi(/6/22)',
        pages: { totalPages: 300, currentPage: 52 },
        href: '/chapter-5.xhtml',
        percentage: 0.18
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-06T18:20:00.000Z'),
      endTime: new Date('2025-01-06T19:20:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/30)',
        pages: { totalPages: 300, currentPage: 60 },
        href: '/chapter-7.xhtml',
        percentage: 0.22
      },
      endLocation: {
        cfi: 'epubcfi(/6/35)',
        pages: { totalPages: 300, currentPage: 65 },
        href: '/chapter-7.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-07T22:10:00.000Z'),
      endTime: new Date('2025-01-07T23:40:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/47)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-34.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/54)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-35.xhtml',
        percentage: 0.26
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-08T09:05:15.000Z'),
      endTime: new Date('2025-01-08T09:17:45.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/50)',
        pages: { totalPages: 300, currentPage: 80 },
        href: '/chapter-10.xhtml',
        percentage: 0.27
      },
      endLocation: {
        cfi: 'epubcfi(/6/51)',
        pages: { totalPages: 300, currentPage: 81 },
        href: '/chapter-15.xhtml',
        percentage: 0.27
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-09T14:50:00.000Z'),
      endTime: new Date('2025-01-09T16:00:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/61)',
        pages: { totalPages: 300, currentPage: 90 },
        href: '/chapter-12.xhtml',
        percentage: 0.31
      },
      endLocation: {
        cfi: 'epubcfi(/6/62)',
        pages: { totalPages: 300, currentPage: 95 },
        href: '/chapter-12.xhtml',
        percentage: 0.32
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date('2025-01-10T23:30:00.000Z'),
      endTime: new Date('2025-01-11T00:20:00.000Z'),
      startLocation: {
        cfi: 'epubcfi(/6/60)',
        pages: { totalPages: 300, currentPage: 90 },
        href: '/chapter-16.xhtml',
        percentage: 0.31
      },
      endLocation: {
        cfi: 'epubcfi(/6/65)',
        pages: { totalPages: 300, currentPage: 95 },
        href: '/chapter-16.xhtml',
        percentage: 0.32
      }
    },
    {
      userId: user.id,
      bookId: book.id,
      startTime: new Date(`${new Date().toISOString().split('T')[0]}T14:50:00.000Z`),
      endTime: new Date(`${new Date().toISOString().split('T')[0]}T17:00:00.000Z`),
      startLocation: {
        cfi: 'epubcfi(/6/60)',
        pages: { totalPages: 400, currentPage: 80 },
        href: '/chapter-14.xhtml',
        percentage: 0.41
      },
      endLocation: {
        cfi: 'epubcfi(/6/65)',
        pages: { totalPages: 450, currentPage: 95 },
        href: '/chapter-14.xhtml',
        percentage: 0.52
      }
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
      endTime: readingEndDate.toISOString(),
      startLocation: {
        cfi: 'epubcfi(/6/40)',
        pages: { totalPages: 300, currentPage: 70 },
        href: '/chapter-28.xhtml',
        percentage: 0.23
      },
      endLocation: {
        cfi: 'epubcfi(/6/55)',
        pages: { totalPages: 300, currentPage: 78 },
        href: '/chapter-29.xhtml',
        percentage: 0.26
      }
    });
  }

  return logs;
};
