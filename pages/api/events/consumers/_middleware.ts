import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest, _ev?: NextFetchEvent) {
  return NextResponse.next();
  // try {
  //     const isSubscriptionConfirmationRequest = 'SubscribeURL' in req.body!;
  //     if (!isSubscriptionConfirmationRequest) {
  //         return NextResponse.next();
  //     } else {
  //         fetch(req.body['SubscribeURL'], {
  //             method: 'GET',
  //         });
  //         return new NextResponse(undefined, { status: 200 });
  //     }
  // } catch (e) {
  //     console.error(e);
  //     return new NextResponse(undefined, { status: 500 });
  // }
}
