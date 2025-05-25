
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// jest.setup.js
global.importMetaEnv = {
  VITE_FIREBASE_API_KEY: "mocked-api-key",
  VITE_FIREBASE_PROJECT_ID: "mocked-project-id",
};
