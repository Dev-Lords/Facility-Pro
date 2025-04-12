module.exports = {
  testEnvironment: 'jsdom',

  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  moduleFileExtensions: ['js', 'jsx'],

  moduleNameMapper: {
    // Mock SVG files
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    // Handle styles (CSS/SCSS)
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },

  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],

  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
