import { authenticateRequest, AUTH_STATUS } from 'lib/authentication';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest, _ev?: NextFetchEvent) {
  try {
    const authStatus = authenticateRequest(req);
    if (authStatus == AUTH_STATUS.ok) {
      return NextResponse.next();
    } else {
      return new NextResponse(undefined, {
        status: authStatus,
        headers: {
          'WWW-Authenticate': 'Basic realm',
        },
      });
    }
  } catch (e) {
    console.error(e);
    return new NextResponse(undefined, { status: 500 });
  }
}
