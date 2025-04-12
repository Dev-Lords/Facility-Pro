
export default {
  testEnvironment: 'jsdom',

  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  moduleFileExtensions: ['js', 'jsx'],

  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>\\src\\mocks\\fileMock.js',
  },

  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],

  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
