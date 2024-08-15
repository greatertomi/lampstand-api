import { BookEntity, BookFormat } from '../../entities';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestUser } from '../test-utils/helper-test';

describe('Books route', () => {
  const factory: TestFactory = new TestFactory();
  const deleteBookRoute = '/books/delete';

  describe('[DELETE] /delete/:id', () => {
    beforeEach(async () => {
      await factory.init();
    });

    afterEach(async () => {
      await factory.close();
    });

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.delete(`${deleteBookRoute}/123`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should delete the book when authenticated and book exists', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      const bookRepository = factory._connection.getRepository(BookEntity);
      const book = await bookRepository.save({
        title: 'Test Book',
        author: 'Test Author',
        cover: 'Test Cover',
        format: BookFormat.PDF,
        size: 1000,
        url: 'http://example.com/book.pdf',
        owner: { id: user.id }
      });

      const response = await factory.app
        .delete(`${deleteBookRoute}/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Book deleted successfully'
      });

      const deletedBook = await bookRepository.findOne({ where: { id: book.id } });
      expect(deletedBook).toBeNull();
    });

    it('should return 404 when book does not exist', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      const response = await factory.app
        .delete(`${deleteBookRoute}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toMatchObject({
        message: 'Book not found or you do not have permission to delete it'
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = JwtHelper.generateToken({ userId: user.id });

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .delete(`${deleteBookRoute}/123`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        message: 'Internal server error'
      });
    });
  });
});
