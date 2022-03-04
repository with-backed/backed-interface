// Jest gives an 'Unexpected token' error for direct imports of NextRequest
// and NextResponse in test files because of the 'export' usage in them.
// See: https://github.com/vercel/next.js/discussions/29750#discussioncomment-1804798
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export { NextRequest, NextResponse };
