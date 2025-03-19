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
    const totalLogs = usersWithBooks.reduce((sum) => {
      return sum + faker.number.int({ min: 5, max: 10 });
    }, 0);
    const readingLogs = Array.from({ length: totalLogs }, () => {
      const user = usersWithBooks[Math.floor(Math.random() * usersWithBooks.length)];
      const book = user.books[Math.floor(Math.random() * user.books.length)];
      const startTime = faker.date.recent({ days: 90 });
      const secondsRead = faker.number.int({ min: 900, max: 5400 });
      const endTime = new Date(startTime.getTime() + secondsRead * 1000);
      return readingLogRepository.create({
        user,
        book,
        startTime,
        endTime,
        secondsRead
      });
    });

    await readingLogRepository.save(readingLogs);
    logger.info('📝 Reading logs seeding complete!');
  }
}
