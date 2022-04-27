import path from 'path';
import dontenv from 'dotenv';
import '@testing-library/jest-dom/extend-expect';
import fetchMock from 'jest-fetch-mock';
import { TextEncoder, TextDecoder } from 'util';

// Minimize console output when testing failure cases
global.console.error = jest.fn();

dontenv.config({ path: path.resolve(__dirname, './.env.test') });

global.fetch = fetchMock;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
