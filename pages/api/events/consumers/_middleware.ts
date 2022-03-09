import { authenticateRequest, AUTH_STATUS } from 'lib/authentication';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest, _ev?: NextFetchEvent) {
  console.log({ req });
  return NextResponse.next();
}
