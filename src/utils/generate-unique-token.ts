import { Repository } from 'typeorm';
import { PasswordResetTokenEntity } from '../entities';
import { TokenStatus } from '../entities/types';
import { logger } from '../services';

// todo: add test for this function
export const generateUniqueToken = async (
  passwordResetTokenRepository: Repository<PasswordResetTokenEntity>
): Promise<number> => {
  const token = Math.floor(100_000 + Math.random() * 900_000);
  const existingToken = await passwordResetTokenRepository.findOne({
    where: { token, status: TokenStatus.ACTIVE }
  });

  if (existingToken) {
    return generateUniqueToken(passwordResetTokenRepository);
  }

  logger.info('Unique Token generated', { location: 'GenerateUniqueToken' });

  return token;
};
