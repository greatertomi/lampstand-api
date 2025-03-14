import { runSeeders } from 'typeorm-extension';
import {
  AppDataSource,
  BookSeeder,
  GoalSeeder,
  LoginHistorySeeder,
  ReadingLogSeeder,
  UserSeeder
} from '../src/database';
import { PasswordTokenResetSeeder } from '../src/database/seeds/PasswordTokenSeeder';
import { logger } from '../src/services';

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
