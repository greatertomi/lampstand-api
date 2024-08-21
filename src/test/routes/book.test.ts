import { BookEntity, BookFormat } from '../../entities';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { getTestAuthToken } from '../test-utils/helper-test';
import { testBook } from '../test-utils/test-data';

describe('Books route', () => {
  const factory = new TestFactory();

  const getBooksRoute = '/books/get';
  const saveBookRoute = '/books/save';

  describe('[GET] /get', () => {
    beforeEach(async () => {
      await factory.init();
    });

    afterEach(async () => {
      await factory.close();
    });

    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(getBooksRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should return user books when authenticated', async () => {
      const token = await getTestAuthToken(factory);

      const postResponse = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test file content'), 'test-file.pdf')
        .field('title', testBook.title)
        .field('author', testBook.author)
        .field('cover', testBook.cover)
        .field('format', BookFormat.PDF)
        .field('url', 'http://example.com/book1.pdf');

      expect(postResponse.status).toBe(HTTP_STATUS.OK);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: [
          {
            title: 'Test Book',
            author: 'Test Author',
            cover: expect.any(String),
            format: 'pdf',
            id: expect.any(String)
          }
        ]
      });

      expect(response.body.data.length).toBe(1);
    });

    it('should return an empty array when user has no books', async () => {
      const token = await getTestAuthToken(factory);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: []
      });
    });

    it('should return 500 when there is a server error', async () => {
      const token = await getTestAuthToken(factory);

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get('/books/get').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        message: 'Internal server error'
      });
    });
  });
});
