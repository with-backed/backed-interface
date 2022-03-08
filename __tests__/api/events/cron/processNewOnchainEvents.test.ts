import { main } from 'lib/events/sqs/consumer';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/processNewOnchainEvents';

jest.mock('lib/events/sqs/consumer', () => ({
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
});
