import { main } from 'lib/notifications/cron/dailyCron';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/cron/notifications';

jest.mock('lib/notifications/cron/dailyCron', () => ({
  main: jest.fn(),
}));

const mockedNotificationsRun = main as jest.MockedFunction<typeof main>;

describe('/api/cron/notifications', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedNotificationsRun.mockResolvedValue();
  });

  describe('Returns 401 if caller is not authenitcated', () => {
    it('Returns 401 if caller is not authenitcated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(mockedNotificationsRun).not.toHaveBeenCalled;
      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('Calls main notification script and returns 200 if authenticated', () => {
    it('Returns 401 if caller is not authenitcated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.NOTIFICATIONS_CRON_API_SECRET_KEY}`,
        },
      });

      await handler(req, res);

      expect(mockedNotificationsRun).toBeCalledTimes(1);
      expect(res._getStatusCode()).toBe(200);
    });
  });
});
