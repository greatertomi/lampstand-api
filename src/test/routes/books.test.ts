import { JwtPayload } from 'jsonwebtoken';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import handleGetRepository from '../../utils/handleGetRepository';
import { TestFactory } from '../factory';
import { testBookData, testBookFile } from '../test-utils/test-data';

jest.mock('../../lib', () => ({
  JwtHelper: {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    verifyToken: jest.fn().mockReturnValue({ id: 'test-user-id', email: 'test@example.com' }),
    generateToken: jest.fn().mockReturnValue('mock-jwt-token')
  }
}));

jest.mock('../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn().mockImplementation((options, callback) => {
      process.nextTick(() =>
        callback(null, {
          public_id: 'test-public-id',
          secure_url: 'https://test-url.com/test-book.pdf',
          bytes: 1024
        })
      );
      return { pipe: jest.fn() };
    })
  }
}));

jest.mock('../../utils/handleGetRepository');

describe('Book Upload and Save Process', () => {
  const factory: TestFactory = new TestFactory();
  const uploadRoute = '/books/save';

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
    jest.clearAllMocks();
  });

  it('should save book data successfully', async () => {
    const mockUploadResult = {
      public_id: 'test-public-id',
      secure_url: 'https://test-url.com/test-book.pdf',
      bytes: 1024
    };

    const mockBookRepository = {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      create: jest.fn().mockReturnValue({ id: 'test-book-id', ...testBookData }),
      save: jest.fn().mockResolvedValue({ id: 'test-book-id', ...testBookData })
    };

    (handleGetRepository as jest.Mock).mockReturnValue(mockBookRepository);

    const mockPayload: JwtPayload = { id: 'test-user-id', email: 'test@example.com' };
    const token = JwtHelper.generateToken(mockPayload);

    const res = await factory.app
      .post(uploadRoute)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testBookFile.buffer, testBookFile.originalName)
      .field('title', testBookData.title)
      .field('author', testBookData.author)
      .field('format', testBookData.format)
      .expect(HTTP_STATUS.OK);

    expect(res.body).toMatchObject({
      message: 'Book uploaded successfully',
      data: {
        id: 'test-book-id',
        title: testBookData.title,
        link: mockUploadResult.secure_url,
        size: mockUploadResult.bytes
      }
    });

    expect(mockBookRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: testBookData.title,
        author: testBookData.author,
        format: testBookData.format,
        size: mockUploadResult.bytes,
        url: mockUploadResult.secure_url,
        owner: { id: 'test-user-id' }
      })
    );
    expect(mockBookRepository.save).toHaveBeenCalled();
  });

  it('should return an error if required fields are missing', async () => {
    const mockPayload: JwtPayload = { id: 'test-user-id', email: 'test@example.com' };
    const token = JwtHelper.generateToken(mockPayload);

    const res = await factory.app
      .post(uploadRoute)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testBookFile.buffer, testBookFile.originalName)
      .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveProperty('title', 'Title is required');
    expect(res.body.errors).toHaveProperty('author', 'Author is required');
    expect(res.body.errors).toHaveProperty('format', 'Invalid book format');
  });

  it('should return an error if no file is provided', async () => {
    const mockPayload: JwtPayload = { id: 'test-user-id', email: 'test@example.com' };
    const token = JwtHelper.generateToken(mockPayload);

    const res = await factory.app
      .post(uploadRoute)
      .set('Authorization', `Bearer ${token}`)
      .field('title', testBookData.title)
      .field('author', testBookData.author)
      .field('format', testBookData.format)
      .expect(HTTP_STATUS.UNPROCESSABLE_ENTITY);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('message', 'No file uploaded');
  });
});
