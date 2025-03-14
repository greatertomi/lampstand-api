import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { UserEntity } from '../../entities';
import { BcryptHelper } from '../../lib';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class UserSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);

    const users = [];
    for (let i = 0; i < 80; i++) {
      const plainPassword = faker.internet.password();
      const hashedPassword = await BcryptHelper.hash(plainPassword);
      users.push(
        userRepository.create({
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          phoneNumber: faker.phone.number(),
          profilePicture: faker.image.avatar(),
          agreedToTerms: faker.datatype.boolean(),
          isEmailVerified: faker.datatype.boolean(),
          createdAt: faker.date.past()
        })
      );
    }
    await userRepository.save(users);
    logger.info('👨‍ Users seeding complete.');
  }
}
