import { LoginHistoryEntity, LoginType, UserEntity } from '../../../entities';
import { logger } from '../../../services';
import handleGetRepository from '../../../utils/handleGetRepository';
import { addLoginHistories } from '../addLoginHistories';

jest.mock('../../../utils/handleGetRepository');
jest.mock('../../../services');

describe('addLoginHistories', () => {
  let testUser: UserEntity;
  let loginHistoryRepositoryMock: jest.Mocked<ReturnType<typeof handleGetRepository>>;

  beforeEach(() => {
    loginHistoryRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    } as unknown as jest.Mocked<ReturnType<typeof handleGetRepository>>;

    (handleGetRepository as jest.Mock).mockReturnValue(loginHistoryRepositoryMock);

    testUser = {
      id: '12345',
      email: 'test@example.com',
      fullName: 'Test User',
      isOAuthUser: false
    } as UserEntity;
  });

  const existingHistory = {
    id: 'history-123',
    user: testUser,
    loginType: LoginType.PASSWORD,
    loginDates: ['2024-11-25T12:00:00.000Z']
  } as LoginHistoryEntity;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new login history if none exists', async () => {
    loginHistoryRepositoryMock.findOne.mockResolvedValueOnce(null);

    loginHistoryRepositoryMock.create.mockImplementation((data) => data as LoginHistoryEntity);

    await addLoginHistories(testUser);

    expect(loginHistoryRepositoryMock.create).toHaveBeenCalledWith({
      user: testUser,
      loginType: LoginType.PASSWORD,
      loginDates: [expect.any(String)]
    });

    expect(loginHistoryRepositoryMock.save).toHaveBeenCalledWith(expect.any(Object));

    expect(logger.info).toHaveBeenCalledWith('Login history updated:', expect.any(Object));
  });

  it('should update existing login history with a new date', async () => {
    loginHistoryRepositoryMock.findOne.mockResolvedValueOnce(existingHistory);

    await addLoginHistories(testUser);

    expect(existingHistory.loginDates).toHaveLength(2);
    expect(new Date(existingHistory.loginDates[1]).toISOString()).toEqual(expect.any(String));

    expect(loginHistoryRepositoryMock.save).toHaveBeenCalledWith(existingHistory);

    expect(logger.info).toHaveBeenCalledWith('Login history updated:', existingHistory);
  });
});
