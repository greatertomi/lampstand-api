import { JwtHelper } from '../../lib';
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

describe('Testing the books route', () => {
  const factory: TestFactory = new TestFactory();
  const deleteBookRoute = '/books/delete';

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
    jest.clearAllMocks();
  });

  describe('POST /books/save', () => {
    it('should save book data successfully', async () => {
      const { token } = await getTestAuthToken(factory);

      const response = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
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
      const { token } = await getTestAuthToken(factory);

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
      const { token } = await getTestAuthToken(factory);

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
          message: 'Authorization header not provided'
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
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should return user books when authenticated', async () => {
      const { token, userId } = await getTestAuthToken(factory);
      await createTestBook(factory, userId);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: [testBook]
      });

      expect(response.body.data.length).toBe(1);
    });

    it('should return an empty array when user has no books', async () => {
      const { token } = await getTestAuthToken(factory);

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Books retrieved successfully',
        data: []
      });
    });

    it('should return 500 when there is a server error', async () => {
      const { token } = await getTestAuthToken(factory);

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'find')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(getBooksRoute).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        message: 'Internal server error'
      });
    });
  });

  describe('[DELETE] /delete/:id', () => {
    it('should return a 401 when no token is provided', async () => {
      const response = await factory.app.delete(`${deleteBookRoute}/123`);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Authorization header not provided' }]
      });
    });

    it('should throw an error when a user attempts to delete a book they did not create', async () => {
      await getTestAuthToken(factory);
      const { user: firstUser } = await createTestUser(factory);
      const book = await createTestBook(factory, firstUser.id);

      const secondUserToken = await getTestAuthToken(factory);

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
      const token = JwtHelper.generateToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName
      });

      const book = await createTestBook(factory, user.id);

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

    it('delete - should return 404 when book does not exist', async () => {
      const token = await getTestAuthToken(factory);
      const response = await factory.app
        .delete(`${deleteBookRoute}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toMatchObject({
        message: 'Book not found or you do not have permission to delete it'
      });
    });

    it('delete-should return 500 when there is a server error', async () => {
      const token = await getTestAuthToken(factory);

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
