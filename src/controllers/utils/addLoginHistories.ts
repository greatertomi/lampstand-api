import { LoginHistoryEntity, LoginType } from '../../entities';
import handleGetRepository from '../../utils/handleGetRepository';

export const addLoginHistories = async (userId: string, loginType: LoginType) => {
  const loginHistoryRepository = handleGetRepository(LoginHistoryEntity);
  await loginHistoryRepository.save({
    user: { id: userId },
    loginType
  });
};
