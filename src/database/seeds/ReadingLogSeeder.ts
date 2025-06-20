import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { ReadingLogEntity, UserEntity } from '../../entities';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class ReadingLogSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const readingLogRepository = handleGetRepository(ReadingLogEntity);

    const users = await userRepository.find({ relations: ['books'] });

    if (users.length === 0) {
      throw new Error('No users found! Please seed users first.');
    }

    const usersWithBooks = users.filter((user) => user.books?.length > 0);
    if (usersWithBooks.length === 0) {
      throw new Error('No users with books found! Please seed books first.');
    }

    const totalLogs = usersWithBooks.length * 3;

    const batchSize = 100;
    for (let i = 0; i < totalLogs; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, totalLogs - i);
      const readingLogs = Array.from({ length: currentBatchSize }, () => {
        const user = usersWithBooks[Math.floor(Math.random() * usersWithBooks.length)];
        const book = user.books[Math.floor(Math.random() * user.books.length)];

        const startTime = faker.date.recent({ days: 90 });
        const duration = faker.number.int({ min: 900, max: 5400 });
        const endTime = new Date(startTime.getTime() + duration * 1000);

        const totalPages = 500;
        const startPage = faker.number.int({ min: 1, max: 400 });
        const endPage = faker.number.int({ min: startPage + 1, max: 500 });

        const startPercentage = Number((startPage / totalPages).toFixed(4));
        const endPercentage = Number((endPage / totalPages).toFixed(4));

        const locationBase = {
          cfi: `epubcfi(/6/${faker.number.int({ min: 10, max: 100 })}!/4/2/${faker.number.int({
            min: 1,
            max: 50
          })}/1:0)`,
          href: faker.helpers.arrayElement([
            'xhtml/33_Chapter_Twenty-Seven.xhtml',
            'chapter001.xhtml',
            'content.xhtml',
            'part1.xhtml'
          ]),
          pages: {
            totalPages
          }
        };

        const startLocation = {
          ...locationBase,
          percentage: startPercentage,
          pages: {
            ...locationBase.pages,
            currentPage: startPage
          }
        };

        const endLocation = {
          ...locationBase,
          percentage: endPercentage,
          pages: {
            ...locationBase.pages,
            currentPage: endPage
          }
        };

        return readingLogRepository.create({
          user,
          book,
          startTime,
          endTime,
          startLocation,
          endLocation
        });
      });

      await readingLogRepository.save(readingLogs);
    }

    logger.info('📝 Reading logs seeding complete!');
  }
}
