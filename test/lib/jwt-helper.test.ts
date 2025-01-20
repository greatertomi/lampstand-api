import { JwtHelper } from '../../src/lib';

jest.mock('../../src/services', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Testing the JWT helper', () => {
  const user = { id: '123', fullName: 'John Doe', email: 'test@test.com' };

  it('should generate a JWT token with the provided userId', () => {
    const token = JwtHelper.generateToken(user);
    expect(typeof token).toBe('string');
  });

  it('should verify a valid JWT token', () => {
    const token = JwtHelper.generateToken(user);
    const decoded = JwtHelper.verifyToken(token);
    expect(decoded).toMatchObject(user);
  });

  it('should throw an error when verifying an invalid JWT token', () => {
    const invalidToken = 'invalid.jwt.token';
    expect(() => {
      JwtHelper.verifyToken(invalidToken);
    }).toThrow();
  });
});
