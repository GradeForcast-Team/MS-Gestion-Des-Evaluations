module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.e2e-spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@services/(.*)$': '<rootDir>/src/services/$1',
      '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
      '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
      '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
      '^@utils/(.*)$': '<rootDir>/src/utils/$1',
      '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
      '^@dtos/(.*)$': '<rootDir>/src/dtos/$1',
    },
  };
  