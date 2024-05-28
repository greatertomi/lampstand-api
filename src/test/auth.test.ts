import { TestFactory } from './factory';

describe('Testing the users route', () => {
  const factory: TestFactory = new TestFactory();

  beforeEach((done) => {
    factory.init().then(done);
  });

  afterEach((done) => {
    factory.close().then(done);
  });

  it.skip('should be able to signup user', async () => {
    // Test case implementation goes here
  });
});