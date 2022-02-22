import path from 'path';
import dontenv from 'dotenv';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';

// Minimize console output when testing failure cases
global.console.error = jest.fn();

dontenv.config({ path: path.resolve(__dirname, './.env.test') });

global.fetch = fetchMock;
