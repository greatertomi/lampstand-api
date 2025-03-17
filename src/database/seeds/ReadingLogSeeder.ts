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

    const readingLogs = [];

    for (const user of users) {
      if (!user.books || user.books.length === 0) continue;

      const numLogs = faker.number.int({ min: 5, max: 10 });
      for (let i = 0; i < numLogs; i++) {
        const book = user.books[Math.floor(Math.random() * user.books.length)];

        const startTime = faker.date.recent({ days: 90 });
        const secondsRead = faker.number.int({ min: 900, max: 5400 });
        const endTime = new Date(startTime.getTime() + secondsRead * 1000);

        readingLogs.push(
          readingLogRepository.create({
            user,
            book,
            startTime,
            endTime,
            secondsRead
          })
        );
      }
    }

    await readingLogRepository.save(readingLogs);
    logger.info('📝 Reading logs seeding complete!');
  }
}
