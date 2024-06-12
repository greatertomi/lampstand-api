import jwt from 'jsonwebtoken';
import { JwtHelper } from '../../lib';
import envConfig from '../../config/envConfig';


describe('Testing the JWT helper', () => {
  const userId = '123';
  let token: string;

  beforeAll(() => {
    token = JwtHelper.generateToken(userId);
  });

  it('should generate a JWT token with the provided userId', () => {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    expect(decoded).toHaveProperty('userId', userId);
  });

  it('should verify a valid JWT token', () => {
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
