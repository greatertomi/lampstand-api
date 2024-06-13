import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import { logger } from '../services';

export const JwtHelper = {
  generateToken(userId: string) {
    return jwt.sign({ userId }, envConfig.JWT_SECRET, { expiresIn: '1d' });
  },
  verifyToken(token: string) {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload & { userId: string };
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }
};
