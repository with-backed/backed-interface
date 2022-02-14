import path from 'path';
import dontenv from 'dotenv';
import '@testing-library/jest-dom/extend-expect';

// Minimize console output when testing failure cases
global.console.error = jest.fn();

dontenv.config({ path: path.resolve(__dirname, './.env.test') });
