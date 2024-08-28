import { faker } from '@faker-js/faker';
import { BookFormat } from '../../entities';

export const testUser = {
  fullName: faker.person.fullName(),
  email: 'davidbrown@gmail.com',
  password: 'Str0ngP@ssw0rd!',
  agreedToTerms: true
};

export const testBook = {
  title: 'Test Book',
  author: 'Test Author',
  format: BookFormat.PDF,
  cover: 'data:image/jpeg;base64,9j4j93'
};
