import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { UserEntity, BookEntity, BookFormat } from '../../entities';
import handleGetRepository from '../../utils/handleGetRepository';
import { logger } from '../../services';

export class BookSeeder implements Seeder {
  async run(): Promise<void> {
    const userRepository = handleGetRepository(UserEntity);
    const bookRepository = handleGetRepository(BookEntity);

    const users = await userRepository.find();
    if (users.length === 0) {
      throw new Error('No users found! Please seed users first.');
    }

    const books = [];

    for (let i = 0; i < 100; i++) {
      const owner = users[Math.floor(Math.random() * users.length)];

      books.push(
        bookRepository.create({
          id: faker.string.uuid(),
          title: faker.lorem.words({ min: 3, max: 8 }),
          author: faker.person.fullName(),
          format: BookFormat.EPUB,
          size: faker.number.int({ min: 500, max: 5000 }),
          url: faker.internet.url(),
          owner,
        })
      );
    }

    await bookRepository.save(books);
    logger.info('📚 Books seeding complete!');
  }
}
