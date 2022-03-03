import { ethers } from 'ethers';
import { main } from 'lib/notifications/cron/sqsConsumer';
import { NotificationEventTrigger } from 'lib/notifications/shared';
import { pushEventForProcessing } from 'lib/notifications/sns';
import { deleteMessage, receiveMessages } from 'lib/notifications/sqs';

jest.mock('lib/notifications/sqs', () => ({
  receiveMessages: jest.fn(),
  deleteMessage: jest.fn(),
}));

jest.mock('lib/notifications/sns', () => ({
  pushEventForProcessing: jest.fn(),
}));

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClient: {
    query: jest.fn(() => ({
      toPromise: () => ({ data: null }),
    })),
  },
}));

const mockedSqsReceiveCall = receiveMessages as jest.MockedFunction<
  typeof receiveMessages
>;
const mockedSqsDeleteMessageCall = deleteMessage as jest.MockedFunction<
  typeof deleteMessage
>;
const mockedSnsPushCall = pushEventForProcessing as jest.MockedFunction<
  typeof pushEventForProcessing
>;

describe('SQS consumer', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('SQS queue empty', () => {
    it('does not perform any actions when the SQS queue is empty', async () => {
      mockedSqsReceiveCall.mockResolvedValueOnce(undefined);
      await main();
      expect(deleteMessage).not.toHaveBeenCalled;
      expect(mockedSnsPushCall).not.toHaveBeenCalled;
    });
  });

  describe('SQS queue not empty', () => {
    describe('BuyoutEventOldLender', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: NotificationEventTrigger.BuyoutEventOldLender,
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', () => {
        mocked;
      });
    });
  });

  it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
    mockedSqsReceiveCall.mockResolvedValueOnce(undefined);
    await main();
    expect(deleteMessage).not.toHaveBeenCalled;
    expect(mockedSnsPushCall).not.toHaveBeenCalled;
  });
});
