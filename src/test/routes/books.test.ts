import { BookFormat } from '../../entities';
import { BookEntity } from '../../entities';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';
import { createTestBook, createTestUser, getTestAuthToken } from '../test-utils/helper-test';
import { testBook } from '../test-utils/test-data';

const uploadLink = 'https://res.cloudinary.com/example/raw/upload/v1234567890/test-book.pdf';
jest.mock('../../middleware/book-upload', () => ({
  bookUploadMiddleware: jest.fn((req, _, next) => {
    req.uploadedFile = {
      bytes: 1024,
      secure_url: uploadLink
    };
    next();
  })
}));
const unAuthenticatedMessage = 'Authorization header not provided';

describe('Testing the books route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
    jest.clearAllMocks();
  });

  describe('POST /books/save', () => {
    const saveBookRoute = '/books/save';
    it('should save book data successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
        // eslint-disable-next-line sonarjs/no-duplicate-string
        .attach('file', Buffer.from('dummy pdf content'), 'test-book.pdf')
        .field(testBook);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Book saved successfully');
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        title: testBook.title,
        link: uploadLink,
        size: 1024
      });
    });

    it('should throw an error if book data is invalid', async () => {
      const bookData = {
        title: 'Test Book'
      };
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('dummy pdf content'), 'test-book.pdf')
        .field(bookData);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        author: 'Author is required',
        format: 'Invalid book format'
      });
    });

    it('should throw an error if the book file is not provided', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
        .field(testBook);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        file: 'No file uploaded'
      });
    });

    it('should throw an error if auth token is not provided', async () => {
      const response = await factory.app.post(saveBookRoute).field(testBook);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.errors).toMatchObject([
        {
          message: unAuthenticatedMessage
        }
      ]);
    });
  });

  describe('[GET] /books', () => {
    const getBooksRoute = '/books';
    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.get(getBooksRoute);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: unAuthenticatedMessage }]
      });
    });

    it('should return user books when authenticated', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      await createTestBook(user.id);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: [testBook]
      });

      expect(response.body.data.length).toBe(1);
    });

    it('should return an empty array when user has no books', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: []
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'Something went wrong'
        }
      ]);
    });
  });

  describe('[DELETE] /delete/:id', () => {
    const deleteBookRoute = '/books/delete';
    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.delete(`${deleteBookRoute}/123`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: unAuthenticatedMessage }]
      });
    });

    it('should throw an error when a user attempts to delete a book they did not create', async () => {
      const { user: firstUser } = await createTestUser(factory);
      await getTestAuthToken(firstUser);
      const book = await createTestBook(firstUser.id);

      const { user: secondUser } = await createTestUser(factory);
      const secondUserToken = await getTestAuthToken(secondUser);

      const response = await factory.app
        .delete(`${deleteBookRoute}/${book.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toMatchObject({
        message: 'Book not found or you do not have permission to delete it'
      });
    });

    it('should delete the book when authenticated and book exists', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const book = await createTestBook(user.id);

      const response = await factory.app
        .delete(`${deleteBookRoute}/${book.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Book deleted successfully'
      });

      const bookRepository = factory._connection.getRepository(BookEntity);
      const deletedBook = await bookRepository.findOne({ where: { id: book.id } });
      expect(deletedBook).toBeNull();
    });

    it('should return 404 when book does not exist', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
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
      const token = await getTestAuthToken(user);

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .delete(`${deleteBookRoute}/123`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.errors).toMatchObject([
        {
          message: 'Something went wrong'
        }
      ]);
    });
  });

  describe('Books update', () => {
    it('should update a book successfully', async () => {
      const token = await getTestAuthToken(factory);
      const postResponse = await factory.app
        .post('/books/save')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('dummy pdf content'), 'test-book.pdf')
        .field('title', testBook.title)
        .field('author', testBook.author)
        .field('cover', testBook.cover)
        .field('format', BookFormat.PDF)
        .field('size', 1000)
        .field('url', 'http://example.com/book1.pdf');
      expect(postResponse.status).toBe(HTTP_STATUS.OK);

      const bookId = postResponse.body.data.id;

      const updatedTitle = 'Updated Book Title';
      const updatedAuthor = 'Updated Book Author';
      const updatedCover = 'data:image/jpeg;base64,updatedCoverData';
      const updateResponse = await factory.app
        .put(`/books/update/${bookId}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('updated pdf content'), 'updated-test-book.pdf')
        .field('title', updatedTitle)
        .field('author', updatedAuthor)
        .field('cover', updatedCover)
        .field('format', BookFormat.PDF);
      expect(updateResponse.status).toBe(HTTP_STATUS.OK);

      const updatedBook = updateResponse.body.data;
      expect(updatedBook.id).toBe(bookId);
      expect(updatedBook.title).toBe(updatedTitle);
      expect(updatedBook.author).toBe(updatedAuthor);
      expect(updatedBook.cover).toBe(updatedCover);
      expect(updatedBook.format).toBe(BookFormat.PDF);
      expect(typeof updatedBook.size).toBe('number');
      expect(updatedBook.url).toContain('https://res.cloudinary.com/');
    });

    it('should return a 404 error if the book is not found', async () => {
      const token = await getTestAuthToken(factory);
      const nonExistentBookId = '4f4ef67c-75fa-4490-bf02-b2429ccb4084';

      const updateResponse = await factory.app
        .put(`/books/update/${nonExistentBookId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Book Title',
          author: 'Updated Book Author',
          cover: 'data:image/jpeg;base64,updatedCoverData',
          format: BookFormat.PDF
        });

      expect(updateResponse.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(updateResponse.body.message).toBe('Book not found');
    });
  });
});
