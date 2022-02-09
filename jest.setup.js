import path from 'path';
import dontenv from 'dotenv';
import '@testing-library/jest-dom/extend-expect';

dontenv.config({ path: path.resolve(__dirname, './.env.test') });
