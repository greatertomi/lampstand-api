import { Request, Response } from 'express';
import passport from 'passport';
import { JwtHelper } from '../../lib';
import { HTTP_STATUS } from '../../lib/responses';
import { TestFactory } from '../factory';

jest.mock('passport');
jest.mock('../../lib');

describe('Testing the Google OAuth routes', () => {
  const factory: TestFactory = new TestFactory();
  const googleAuthRoute = '/auth/google';
  const googleCallbackRoute = '/auth/google/callback';

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
    jest.clearAllMocks();
  });

  describe('GET /google', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const mockAuthenticateHandler = (_req: Request, res: Response) => {
      res.sendStatus(HTTP_STATUS.OK);
    };

    it('should initiate Google OAuth flow', async () => {
      const mockAuthenticate = jest.fn(() => mockAuthenticateHandler);
      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const res = await factory.app.get(googleAuthRoute);

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(passport.authenticate).toHaveBeenCalledWith('google', { scope: ['profile', 'email'] });
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should handle successful Google authentication', async () => {
      const mockUser = {
        id: '123',
        fullName: 'Test User',
        emailAddress: 'test@example.com'
      };

      const mockAuthenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
        callback(null, mockUser)(req as Request, res as Response, next);
      });

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);
      (JwtHelper.generateToken as jest.Mock).mockReturnValue('mock_token');

      const res = await factory.app.get(googleCallbackRoute).expect(HTTP_STATUS.OK);

      expect(res.body).toEqual({
        message: 'Google authentication successful',
        token: 'mock_token',
        data: {
          id: mockUser.id,
          fullName: mockUser.fullName,
          email: mockUser.emailAddress
        }
      });

      expect(JwtHelper.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.emailAddress
      });
    });

    it('should handle authentication failure', async () => {
      const mockAuthenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
        callback(null, false)(req as Request, res as Response, next);
      });

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const res = await factory.app.get(googleCallbackRoute).expect(HTTP_STATUS.UNAUTHORIZED);

      expect(res.body).toEqual({ message: 'Authentication failed' });
    });

    it('should handle authentication error', async () => {
      const mockAuthenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
        callback(new Error('Auth Error'))(req as Request, res as Response, next);
      });

      (passport.authenticate as jest.Mock).mockImplementation(mockAuthenticate);

      const res = await factory.app
        .get(googleCallbackRoute)
        .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR);

      expect(res.body).toEqual({ message: 'Authentication failed' });
    });
  });
});
