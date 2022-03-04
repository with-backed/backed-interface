import { NextRequest } from 'next/server';
import middleware from 'pages/api/events/_middleware';

describe('/api/events/_middleware', () => {
  it('should return 200 for authenticated calls', () => {
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Bearer ${process.env.NOTIFICATIONS_CRON_API_SECRET_KEY}`,
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('should return 401 for invalid secret', () => {
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Bearer invalid_secret`,
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 for missing header', () => {
    const req = new NextRequest('http://example.com');

    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('should return 500 for unassigned secret', () => {
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Bearer ${process.env.NOTIFICATIONS_CRON_API_SECRET_KEY}`,
      },
    });

    const secret = process.env.NOTIFICATIONS_CRON_API_SECRET_KEY;
    delete process.env.NOTIFICATIONS_CRON_API_SECRET_KEY;

    const res = middleware(req);
    expect(res.status).toBe(500);

    process.env.NOTIFICATIONS_CRON_API_SECRET_KEY = secret;
  });
});
