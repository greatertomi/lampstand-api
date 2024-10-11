export default {
  globalSetup: './src/test/jest-setup/jest-setup.ts',
  globalTeardown: './src/test/jest-setup/jest-teardown.ts',
  coveragePathIgnorePatterns: ['.config.js'],
  preset: 'ts-jest',
  testTimeout: process.env.CI ? 120_000 : 12_000,
  transform: {
    '^.+\\.test.ts?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/e2e/', '/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./src/test/jest-setup/mocks.ts'],
  // Run tests serially on local machine to avoid race conditions on docker resources
  ...(!process.env.CI && { maxWorkers: 1 })
};
