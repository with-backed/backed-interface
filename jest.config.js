const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/index.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json-summary', 'text'],
  coverageThreshold: {
    global: {
      branches: 28,
      functions: 27.5,
      lines: 31.5,
      statements: 31,
    },
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/pages/'],
};

module.exports = createJestConfig(customJestConfig);
