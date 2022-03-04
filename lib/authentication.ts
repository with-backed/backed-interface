import { IncomingHttpHeaders } from 'http';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export const AUTH_STATUS = {
  ok: 200,
  unauthorized: 401,
  forbidden: 403,
  internalError: 500,
};

export function authenticateRequest(req: NextApiRequest | NextRequest) {
  // Next APIs use type NextApiRequest (IncomingMessage-like)
  // Next middleware uses type NextRequest (Fetch API Request-like)
  // Explanation: https://github.com/vercel/next.js/issues/30534
  try {
    // Since `req` can be IncomingMessage-like, we can't use headers.get(...)
    // outright. Need to account for both NextApiRequest and NextRequest.
    var authorization;
    if (typeof req.headers.get === 'function') {
      authorization = req.headers.get('authorization');
    } else {
      // Temporarily cast req.headers so that typescript doesn't complain
      // about indexing object 'authorization' (which isn't explicitly defined
      // in NextRequest). It's okay if the header isn't available at runtime.
      const headers = req.headers as typeof req.headers & {
        authorization?: string;
      };
      authorization = headers['authorization'];
    }

    const secret = process.env.NOTIFICATIONS_CRON_API_SECRET_KEY;

    if (!secret) {
      console.error('Authentication secret is not set');
      return AUTH_STATUS.internalError;
    }

    if (authorization === `Bearer ${secret}`) {
      return AUTH_STATUS.ok;
    } else {
      return AUTH_STATUS.unauthorized;
    }
  } catch (e) {
    console.error(e);
    return AUTH_STATUS.internalError;
  }
}
