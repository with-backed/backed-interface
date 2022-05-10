import { NextRequest } from 'next/server';
import middleware from 'pages/api/network/[network]/events/_middleware';

describe('/api/events/_middleware', () => {
  it('should return 200 for authenticated calls', () => {
    const base64Encoded = Buffer.from(
      `username:${process.env.EVENTS_API_SECRET_KEY}`,
      'ascii',
    ).toString('base64');
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Basic ${base64Encoded}`,
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('should return 401 for invalid secret', () => {
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Basic invalid_secret`,
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 for missing header with WWW-authenticate', () => {
    const req = new NextRequest('http://example.com');

    const res = middleware(req);
    expect(res.status).toBe(401);
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm');
  });

  it('should return 500 for unassigned secret', () => {
    const req = new NextRequest('http://example.com', {
      headers: {
        authorization: `Bearer ${process.env.EVENTS_API_SECRET_KEY}`,
      },
    });

    const secret = process.env.EVENTS_API_SECRET_KEY;
    delete process.env.EVENTS_API_SECRET_KEY;

    const res = middleware(req);
    expect(res.status).toBe(500);

    process.env.EVENTS_API_SECRET_KEY = secret;
  });
});
