import { Repository } from 'typeorm';
import { LoginHistoryEntity } from '../entities/LoginHistoryEntity';
import handleGetRepository from '../utils/handleGetRepository';

export class LoginHistoryService {
  static instance: LoginHistoryService;
  private loginHistoryRepository: Repository<LoginHistoryEntity>;

  private constructor() {
    this.loginHistoryRepository = handleGetRepository(LoginHistoryEntity);
  }

  public static getInstance(): LoginHistoryService {
    if (!LoginHistoryService.instance) {
      LoginHistoryService.instance = new LoginHistoryService();
    }
    return LoginHistoryService.instance;
  }

  public async logLogin(userId: string, loginType: 'OAuth' | 'Password'): Promise<void> {
    const loginHistory = this.loginHistoryRepository.create({
      userId,
      loginType
    });
    await this.loginHistoryRepository.save(loginHistory);
  }
}
