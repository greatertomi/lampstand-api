import { LoginHistoryEntity, LoginType, UserEntity } from '../../entities';
import { logger } from '../../services';
import { JwtPayload } from '../../types';
import handleGetRepository from '../../utils/handleGetRepository';

export const addLoginHistories = async (user: UserEntity | JwtPayload) => {
  const loginType: LoginType =
    user instanceof UserEntity && user.isOAuthUser ? LoginType.OAUTH : LoginType.PASSWORD;

  const loginHistoryRepository = handleGetRepository(LoginHistoryEntity);

  let userLoginHistory = await loginHistoryRepository.findOne({
    where: { user: { id: user.id } }
  });

  userLoginHistory =
    userLoginHistory ||
    loginHistoryRepository.create({
      user: user,
      loginType,
      loginDates: []
    });

  userLoginHistory.loginDates.push(new Date().toISOString());

  await loginHistoryRepository.save(userLoginHistory);

  logger.info('Login history updated:', userLoginHistory);
};
