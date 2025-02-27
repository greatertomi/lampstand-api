/* eslint-disable sonarjs/no-duplicate-string */
import { BookEntity, BookFormat } from '../../src/entities';
import { HTTP_STATUS } from '../../src/lib/responses';
import { TestFactory } from '../factory';
import { createTestBook, createTestUser, getTestAuthToken } from '../test-utils/helper-test';
import {
  extractMetadataValue,
  getMockBookData,
  mockBooksData,
  testBook,
  testMultipleBooks
} from '../test-utils/test-data';

const uploadLink = 'https://res.cloudinary.com/example/raw/upload/v1234567890/test-book.pdf';

const uploadLinks = [
  'https://res.cloudinary.com/example/raw/upload/v1234567890/test-book.epub',
  'https://res.cloudinary.com/example/raw/upload/v1234567890/test-book:the-duology.epub'
];

jest.mock('../../src/middleware/upload-handlers/book-upload', () => ({
  bookUploadMiddleware: jest.fn((req, _, next) => {
    req.uploadedFile = {
      bytes: 1024,
      secure_url: uploadLink
    };
    next();
  }),
  multipleBooksUploadMiddleware: jest.fn((req, _, next) => {
    req.uploadedFiles = req.files.map((file, index) => {
      const format =
        file.mimetype === 'application/epub+zip' ? 'epub' : file.mimetype.split('/').pop();
      return {
        secure_url: uploadLinks[index],
        bytes: file.size,
        format
      };
    });
    next();
  })
}));

jest.mock('../../src/utils/EpubProcessor', () => {
  const mockEpubProcessor = jest.fn().mockImplementation((bookPath) => ({
    process: jest.fn(() => {
      if (bookPath.includes('test-book.epub')) {
        return getMockBookData(mockBooksData[0]);
      }

      if (bookPath.includes('test-book:the-duology.epub')) {
        return getMockBookData(mockBooksData[1]);
      }

      return Promise.resolve(null);
    }),
    getBookImage: jest.fn(async () => 'data:image/jpeg;base64,MOCK_BASE64_IMAGE'),
    cleanup: jest.fn()
  }));

  const mockStaticMethods = {
    extractMetadataValue: jest.fn((property) => extractMetadataValue(property))
  };

  return {
    EpubProcessor: Object.assign(mockEpubProcessor, mockStaticMethods)
  };
});

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

    it('should throw an error if book id is invalid', async () => {
      const invalidIdBook = {
        id: '',
        title: 'Test Book',
        author: 'Test Author',
        format: BookFormat.PDF,
        cover: 'data:image/jpeg;base64,9j4j93'
      };
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveBookRoute)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('dummy pdf content'), 'test-book.pdf')
        .field(invalidIdBook);

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        id: 'Id must be a valid UUID'
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
        errors: [
          {
            message: 'Book not found or you do not have permission to delete it'
          }
        ]
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
        errors: [
          {
            message: 'Book not found or you do not have permission to delete it'
          }
        ]
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

  describe('[PUT] /books/update/:id', () => {
    it('should update a book successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const newBook = await createTestBook(user.id);
      const updatedBookData = {
        title: 'Updated Book Title',
        author: 'Updated Book Author',
        cover: 'data:image/jpeg;base64,updatedCoverData',
        format: BookFormat.PDF
      };

      const updateResponse = await factory.app
        .put(`/books/update/${newBook.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('updated pdf content'), 'updated-test-book.pdf')
        .field(updatedBookData);

      expect(updateResponse.status).toBe(HTTP_STATUS.OK);

      const updatedBook = updateResponse.body.data;
      expect(updatedBook).toMatchObject({
        id: newBook.id,
        ...updatedBookData
      });
      expect(typeof updatedBook.size).toBe('number');
      expect(updatedBook.url).toContain('https://res.cloudinary.com/');
    });

    it('should return a 404 error if the book is not found', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const nonExistentBookId = '4f4ef67c-75fa-4490-bf02-b2429ccb4084';

      const updateResponse = await factory.app
        .put(`/books/update/${nonExistentBookId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(testBook);

      expect(updateResponse.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(updateResponse.body.errors).toEqual([{ message: 'Book not found' }]);
    });

    it('should return a 401 when no token is provided for updating a book', async () => {
      const updateBookRoute = '/books/update';
      const { user } = await createTestUser(factory);
      const testBooks = await createTestBook(user.id);
      const bookId = testBooks.id;

      const updateData = {
        title: 'Updated Title',
        author: 'Updated Author',
        format: BookFormat.PDF
      };

      const response = await factory.app.put(`${updateBookRoute}/${bookId}`).field(updateData);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toMatchObject({
        errors: [{ message: unAuthenticatedMessage }]
      });
    });

    it('should throw a server error if an exception occurs during book update', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const testBooks = await createTestBook(user.id);
      const updateBookRoute = '/books/update';

      const updateData = {
        title: 'Updated Title',
        author: 'Updated Author',
        format: BookFormat.PDF,
        cover: 'data:image/jpeg;base64,validCoverData'
      };

      jest
        .spyOn(factory._connection.getRepository(BookEntity), 'update')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app
        .put(`${updateBookRoute}/${testBooks.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field(updateData);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toMatchObject({
        errors: [{ message: 'Something went wrong' }]
      });
    });

    it('should throw an error if the book data is invalid', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);
      const testBooks = await createTestBook(user.id);

      const invalidBookData = {
        title: 'king arthur',
        author: '',
        format: 'InvalidFormat',
        cover: 'not-a-base64-image'
      };

      const updateResponse = await factory.app
        .put(`/books/update/${testBooks.id}`)
        .set('Authorization', `Bearer ${token}`)
        .field(invalidBookData)
        .attach('file', Buffer.from('not a pdf'), 'test.txt'); // Invalid: not a PDF file

      expect(updateResponse.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(updateResponse.body).toHaveProperty('errors');

      const expectedErrorMessages = [
        'Title is required',
        'Author is required',
        'Invalid book format',
        'must be a valid Base64 encoded image',
        'Uploaded file must be a PDF'
      ];

      const errors = updateResponse.body.errors as Record<string, string>;
      const hasExpectedError = expectedErrorMessages.some((message) =>
        Object.values(errors).some((error) => error.includes(message))
      );
      expect(hasExpectedError).toBe(true);
    });
  });

  describe('POST /books/saveMultiple', () => {
    const saveMultipleBooks = '/books/saveMultiple';
    it('should save books data successfully', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveMultipleBooks)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('files', Buffer.from('dummy epub book'), 'test-book.epub')
        .attach('files', Buffer.from('dummy epub book'), 'test-book:the-duology.epub');

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.message).toBe('Books saved successfully');
      expect(response.body.data).toMatchObject(
        testMultipleBooks.map((book, index) => ({
          id: expect.any(String),
          title: book.title,
          author: book.author,
          link: uploadLinks[index],
          size: 15
        }))
      );
    });

    it('should throw an error if no file is provided', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveMultipleBooks)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({ files: 'At least one file must be uploaded' });
    });

    it('should throw an error if auth token is not provided', async () => {
      const response = await factory.app.post(saveMultipleBooks);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.errors).toMatchObject([
        {
          message: unAuthenticatedMessage
        }
      ]);
    });

    it('should throw an error when the file is not EPUB', async () => {
      const { user } = await createTestUser(factory);
      const token = await getTestAuthToken(user);

      const response = await factory.app
        .post(saveMultipleBooks)
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('dummy pdf'), 'test-book.pdf');

      expect(response.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toMatchObject({
        files: 'Uploaded file must be a EPUB'
      });
    });
  });
});
