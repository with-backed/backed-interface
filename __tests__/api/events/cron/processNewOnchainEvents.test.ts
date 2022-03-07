import { main } from 'lib/notifications/cron/sqsConsumer';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/processNewOnchainEvents';

jest.mock('lib/notifications/cron/sqsConsumer', () => ({
  main: jest.fn(),
}));

const mockedSqsConsumerRun = main as jest.MockedFunction<typeof main>;

describe('/api/events/cron/processNewOnchainEvents', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedSqsConsumerRun.mockResolvedValue();
  });

  describe('Returns 401 if caller is not authenitcated', () => {
    it('Returns 401 if caller is not authenitcated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
      });

      await handler(req, res);

      expect(mockedSqsConsumerRun).not.toHaveBeenCalled;
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

      expect(mockedSqsConsumerRun).toBeCalledTimes(1);
      expect(res._getStatusCode()).toBe(200);
    });
  });
});
