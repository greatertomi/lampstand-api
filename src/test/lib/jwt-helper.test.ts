import { JwtHelper } from '../../lib';

describe('Testing the JWT helper', () => {
  const userId = '123';

  it('should generate a JWT token with the provided userId', () => {
    const token = JwtHelper.generateToken(userId);
    expect(typeof token).toBe('string');
  });

  it('should verify a valid JWT token', () => {
    const token = JwtHelper.generateToken(userId);
    const decoded = JwtHelper.verifyToken(token);
    expect(decoded).toHaveProperty('userId', userId);
  });

  it('should throw an error when verifying an invalid JWT token', () => {
    const invalidToken = 'invalid.jwt.token';
    expect(() => {
      JwtHelper.verifyToken(invalidToken);
    }).toThrow();
  });
});
