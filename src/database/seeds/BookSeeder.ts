import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { BookEntity, BookFormat, UserEntity } from '../../entities';
import { logger } from '../../services';
import handleGetRepository from '../../utils/handleGetRepository';

export class BookSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const bookRepository = handleGetRepository(BookEntity);

    const users = await userRepository.find();
    if (users.length === 0) {
      throw new Error('No users found! Please seed users first.');
    }

    const books = [];

    for (const user of users) {
      books.push(
        bookRepository.create({
          id: faker.string.uuid(),
          title: faker.lorem.words({ min: 3, max: 8 }),
          author: faker.person.fullName(),
          format: BookFormat.EPUB,
          size: faker.number.int({ min: 500, max: 5000 }),
          url: faker.internet.url(),
          owner: user
        })
      );
    }

    await bookRepository.save(books);
    logger.info('📚 Books seeding complete!');
  }
}
