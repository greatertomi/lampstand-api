import { addLoginHistories } from '../../src/controllers/utils';
import { LoginHistoryEntity, LoginType } from '../../src/entities';
import { TestFactory } from '../factory';
import { createTestUser } from '../test-utils/helper-test';

describe('addLoginHistories', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it('It inserts a new login history', async () => {
    const { user } = await createTestUser(factory);
    await addLoginHistories(user.id, LoginType.PASSWORD);

    const loginHistoryRepository = factory._connection.getRepository(LoginHistoryEntity);
    const loginHistories = await loginHistoryRepository.find({ where: { user: { id: user.id } } });

    // This is having length of 2 because, the createTestUser function is creating a user and adding a login history
    expect(loginHistories).toHaveLength(2);
  });
});
