import { runSeeders } from 'typeorm-extension';
import {
  AppDataSource,
  BookSeeder,
  GoalSeeder,
  LoginHistorySeeder,
  ReadingLogSeeder,
  UserSeeder
} from '../database';
import { PasswordTokenResetSeeder } from '../database/seeds/PasswordTokenSeeder';
import { logger } from '../services';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  try {
    await AppDataSource.initialize();

    await runSeeders(AppDataSource, {
      seeds: [
        UserSeeder,
        LoginHistorySeeder,
        BookSeeder,
        GoalSeeder,
        PasswordTokenResetSeeder,
        ReadingLogSeeder
      ]
    });

    logger.info('Seeding complete!');
  } catch (error) {
    logger.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
})();
