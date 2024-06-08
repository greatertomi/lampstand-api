import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../services';

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { userId: string };
  } catch (error) {
    logger.error('Error verifying token:', error);
    throw error;
  }
};
