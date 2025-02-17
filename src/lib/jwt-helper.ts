import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig';
import { logger } from '../services';
import { JwtPayload } from '../types';

export const JwtHelper = {
  generateToken: (data: JwtPayload) => jwt.sign(data, envConfig.JWT_SECRET, { expiresIn: '30d' }),
  verifyToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      logger.error({
        location: 'JwtHelper.verifyToken',
        error: error.message,
        message: `Error verifying token: ${error.message}`
      });
      throw error;
    }
  }
};
