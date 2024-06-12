import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../services';
import envConfig from '../config/envConfig';


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
