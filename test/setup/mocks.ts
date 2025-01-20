jest.mock('../../src/services', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  },
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}));
