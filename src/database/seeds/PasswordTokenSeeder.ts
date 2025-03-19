import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { PasswordResetTokenEntity, UserEntity } from '../../entities';
import { TokenStatus } from '../../entities/types';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class PasswordTokenResetSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const passwordResetTokenRepository = handleGetRepository(PasswordResetTokenEntity);

    const users = await userRepository.find();

    if (users.length === 0) {
      throw new Error('No users found! Please seed users first.');
    }

    const passwordResetTokenSeeds = users.map((user) => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      return passwordResetTokenRepository.create({
        user,
        token: faker.number.int({ min: 1000, max: 9999 }),
        createdAt: now,
        expiresAt,
        usedAt: null,
        status: TokenStatus.ACTIVE
      });
    });

    await passwordResetTokenRepository.save(passwordResetTokenSeeds);
    logger.info('🕵️ Password reset tokens seeding complete!');
  }
}
