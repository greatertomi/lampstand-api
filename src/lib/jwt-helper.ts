import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import { logger } from '../services';
import { JwtPayload } from '../types';

export const JwtHelper = {
  generateToken(data: JwtPayload) {
    return jwt.sign(data, envConfig.JWT_SECRET, { expiresIn: '30d' });
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
