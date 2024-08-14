import { BookEntity, BookFormat } from '../../entities';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser } from '../test-utils/helper-test';

describe('Books route', () => {
  const factory: TestFactory = new TestFactory();
  const booksRoute = '/books/get';

  describe('[GET] /get', () => {
    beforeEach(async () => {
      await factory.init();
    });

    afterEach(async () => {
      await factory.close();
    });

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(booksRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should return user books when authenticated', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      const bookRepository = factory._connection.getRepository(BookEntity);
      await bookRepository.save([
        {
          title: 'Test Book 1',
          author: 'Test Author 1',
          cover: 'Test Cover 1',
          format: BookFormat.PDF,
          size: 1000,
          url: 'http://example.com/book1.pdf',
          owner: { id: user.id }
        },
        {
          title: 'Test Book 2',
          author: 'Test Author 2',
          cover: 'Test Cover 2',
          format: BookFormat.EPUB,
          size: 2000,
          url: 'http://example.com/book2.epub',
          owner: { id: user.id }
        }
      ]);

      const response = await factory.app.get(booksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Book 1',
            author: 'Test Author 1',
            cover: 'Test Cover 1',
            format: BookFormat.PDF,
            size: 1000,
            url: 'http://example.com/book1.pdf',
            owner: expect.objectContaining({ id: user.id })
          }),
          expect.objectContaining({
            title: 'Test Book 2',
            author: 'Test Author 2',
            cover: 'Test Cover 2',
            format: BookFormat.EPUB,
            size: 2000,
            url: 'http://example.com/book2.epub',
            owner: expect.objectContaining({ id: user.id })
          })
        ])
      });
    });

    it('should return an empty array when user has no books', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      const response = await factory.app.get(booksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: []
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(booksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        message: 'Internal server error'
      });
    });
  });
});
