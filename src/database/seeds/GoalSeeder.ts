import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { ReadingGoal, UserEntity } from '../../entities';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class GoalSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const goalRepository = handleGetRepository(ReadingGoal);

    const users = await userRepository.find();

    if (users.length === 0) {
      throw new Error('No users found! Make sure to seed users first.');
    }
    const readingGoals = [];

    for (const user of users) {
      const existingGoal = await goalRepository.findOne({ where: { user: { id: user.id } } });

      if (existingGoal) {
        continue;
      }

      readingGoals.push(
        goalRepository.create({
          user,
          goalInSeconds: faker.number.int({ min: 900, max: 5400 }),
          reminderTime: faker.date
            .between({
              from: '2025-01-01T06:00:00.000Z',
              to: '2025-03-01T22:00:00.000Z'
            })
            .toISOString()
            .split('T')[1]
            .slice(0, 8),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
    }
    await goalRepository.save(readingGoals);
    logger.info('📌 Goals seeding complete.');
  }
}
