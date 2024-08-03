import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import { logger } from '../services';

export const JwtHelper = {
  generateToken(data: JwtPayload) {
    return jwt.sign(data, envConfig.JWT_SECRET, { expiresIn: '1d' });
  },
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }
};
