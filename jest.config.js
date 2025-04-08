export default {
  
    testEnvironment: "jsdom",

    moduleNameMapper: {
      // Mock SVG files
      "\\.svg$": "<rootDir>/__mocks__/svgMock.js",

      // Handle other file types as needed
      "\\.(css|less|scss)$": "identity-obj-proxy"
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!src/**/*.test.{js,jsx}",
      "!**/node_modules/**"
    ],
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest"
    }
  };