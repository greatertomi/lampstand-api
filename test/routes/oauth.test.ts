/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express';
import { handleGoogleOauthCallback } from '../../src/controllers';
import { TestFactory } from '../factory';

jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => (req: any, res: Response, next: NextFunction) => {
    if (strategy === 'google') {
      if (req.authError && options.failureRedirect) {
        return res.redirect(options.failureRedirect);
      }
      return next();
    }
  })
}));

jest.mock('../../src/controllers', () => ({
  handleGoogleOauthCallback: jest.fn((req, res) => res.status(200).json({ message: 'Success' }))
}));

describe('Oauth test', () => {
  const factory = new TestFactory();

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
  });

  it('should call handleGoogleOauthCallback on successful authentication', async () => {
    const response = await factory.app.get('/oauth/google/callback');
    expect(handleGoogleOauthCallback).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');
  });
});
