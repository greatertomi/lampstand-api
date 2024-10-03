/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable sonarjs/no-duplicate-string */
import passport from 'passport';
import { OAuthUser } from '../../controllers';
import { UserEntity } from '../../entities';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import handleGetRepository from '../../utils/handleGetRepository';
import { TestFactory } from '../factory';

jest.mock('passport');
jest.mock('../../lib');
jest.mock('../../utils/handleGetRepository');

const handleFailureRedirect = (req, res, next) => {
  res.redirect('/oauth/google/failure');
};

describe('Testing the Google OAuth routes', () => {
  const factory: TestFactory = new TestFactory();
  const googleAuthRoute = '/oauth/google';
  const googleCallbackRoute = '/oauth/google/callback';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });

  describe('GET /google', () => {
    it('should initiate Google OAuth flow', async () => {
      const mockAuthenticate = jest.fn((strategy, options) => (req, res, next) => {
        expect(strategy).toBe('google');
        expect(options).toEqual({ scope: ['email', 'profile'], session: false });
        res.sendStatus(HTTP_STATUS.OK);
      });
      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const res = await factory.app.get(googleAuthRoute);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(passport.authenticate).toHaveBeenCalledWith('google', {
        scope: ['email', 'profile'],
        session: false
      });
    });
  });

  describe('GET /oauth/google/callback', () => {
    it('should handle successful authentication', async () => {
      const mockUserId = 'mock-uuid-1234';

      const mockUser: OAuthUser = {
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'http://example.com/photo.jpg' }]
      };

      const mockAuthenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
        callback(null, mockUser, null);
      });

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const mockUserEntity = new UserEntity();
      mockUserEntity.id = mockUserId;
      mockUserEntity.fullName = 'Test User';
      mockUserEntity.emailAddress = 'test@example.com';
      mockUserEntity.profilePicture = 'http://example.com/photo.jpg';
      mockUserEntity.isOAuthUser = true;
      mockUserEntity.agreedToTerms = true;

      (handleGetRepository as jest.Mock).mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockUserEntity),
        create: jest.fn().mockReturnValue(mockUserEntity),
        save: jest.fn().mockResolvedValue(mockUserEntity)
      });

      (JwtHelper.generateToken as jest.Mock).mockReturnValue('mock-token');

      const res = await factory.app.get(googleCallbackRoute);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toEqual({
        message: 'OAuth login successful',
        token: 'mock-token',
        data: {
          id: mockUserId,
          fullName: 'Test User',
          email: 'test@example.com'
        }
      });
    });

    it('should handle authentication failure', async () => {
      const mockAuthenticate = jest.fn((strategy, options, callback) => handleFailureRedirect);

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const res = await factory.app.get(googleCallbackRoute);

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/oauth/google/failure');
    });

    it('should create a new user if not found', async () => {
      const mockUserId = 'mock-uuid-5678';

      const mockUser: OAuthUser = {
        emails: [{ value: 'newuser@example.com' }],
        displayName: 'New User',
        photos: [{ value: 'http://example.com/newphoto.jpg' }]
      };

      const mockAuthenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
        callback(null, mockUser, null);
      });

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const mockUserEntity = new UserEntity();
      mockUserEntity.id = mockUserId;
      mockUserEntity.fullName = 'New User';
      mockUserEntity.emailAddress = 'newuser@example.com';
      mockUserEntity.profilePicture = 'http://example.com/newphoto.jpg';
      mockUserEntity.isOAuthUser = true;
      mockUserEntity.agreedToTerms = true;

      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(mockUserEntity),
        save: jest.fn().mockResolvedValue(mockUserEntity)
      };

      (handleGetRepository as jest.Mock).mockReturnValue(mockRepository);

      (JwtHelper.generateToken as jest.Mock).mockReturnValue('new-user-token');

      const res = await factory.app.get(googleCallbackRoute);

      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body).toEqual({
        message: 'OAuth login successful',
        token: 'new-user-token',
        data: {
          id: mockUserId,
          fullName: 'New User',
          email: 'newuser@example.com'
        }
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        fullName: 'New User',
        emailAddress: 'newuser@example.com',
        agreedToTerms: true,
        isOAuthUser: true,
        profilePicture: 'http://example.com/newphoto.jpg'
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockUserEntity);
    });
  });
  describe('GET /oauth/google/failure', () => {
    it('should handle Google OAuth failure', async () => {
      const res = await factory.app
        .get('/oauth/google/failure')
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(res.body).toEqual({ message: 'Google OAuth failed' });
    });
  });
});
