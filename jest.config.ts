export default {
  globalSetup: './test/setup/jest-setup.ts',
  globalTeardown: './test/setup/jest-teardown.ts',
  coveragePathIgnorePatterns: ['.config.js'],
  preset: 'ts-jest',
  testTimeout: process.env.CI ? 120_000 : 12_000,
  transform: {
    '^.+\\.test.ts?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/e2e/', '/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./test/setup/mocks.ts'],
  // Run tests serially on local machine to avoid race conditions on docker resources
  ...(!process.env.CI && { maxWorkers: 1 })
};
