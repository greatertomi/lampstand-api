import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { LoginHistoryEntity, LoginType, UserEntity } from '../../entities';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class LoginHistorySeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const loginHistoryRepository = handleGetRepository(LoginHistoryEntity);

    const users = await userRepository.find();

    if (users.length === 0) {
      throw new Error('No users found! Please seed users first.');
    }

    const loginHistories = [];

    for (const user of users) {
      const loginAt = faker.date.recent({ days: 30 });
      const loginTypes = [LoginType.OAUTH, LoginType.PASSWORD];
      const loginType = loginTypes[Math.floor(Math.random() * loginTypes.length)];

      loginHistories.push(
        loginHistoryRepository.create({
          user,
          loginType,
          loginAt
        })
      );
    }

    await loginHistoryRepository.save(loginHistories);
    logger.info('📋 Login history seeding complete!');
  }
}
