import { BookEntity, BookFormat } from '../../src/entities';
import { JwtPayload } from '../../src/types';

export const testUser = {
  fullName: 'David Brown',
  email: 'davidbrown@gmail.com',
  password: 'Str0ngP@ssw0rd!',
  agreedToTerms: true
};

export const testBook = {
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
      currentTime: now
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 86_400_000),
      currentTime: new Date(now.getTime() - 86_400_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 432_000_000),
      currentTime: new Date(now.getTime() - 432_000_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 691_200_000),
      currentTime: new Date(now.getTime() - 691_200_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 30,
      startTime: new Date(now.getTime() - 2_505_600_000),
      currentTime: new Date(now.getTime() - 2_505_600_000)
    },
    {
      userId: user.id,
      bookId: book.id,
      minutesRead: 45,
      startTime: new Date(now.getTime() - 2_678_400_000),
      currentTime: new Date(now.getTime() - 2_678_400_000)
    }
  ];
};
