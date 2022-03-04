import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { main } from 'lib/notifications/cron/sqsConsumer';
import { NotificationTriggerType } from 'lib/notifications/shared';
import { pushEventForProcessing } from 'lib/notifications/sns';
import { deleteMessage, receiveMessages } from 'lib/notifications/sqs';
import { nftBackedLoansClient } from 'lib/urql';

const subgraphLoanCopy = {
  ...subgraphLoan,
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

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
    query: jest.fn(),
  },
}));

const mockedNftBackedLoansClientQuery =
  nftBackedLoansClient.query as jest.MockedFunction<
    typeof nftBackedLoansClient.query
  >;

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
    describe('BuyoutEvent', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: 'BuyoutEvent',
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              buyoutEvent: null,
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).not.toHaveBeenCalled;
        expect(mockedSqsDeleteMessageCall).not.toHaveBeenCalled;
      });

      it('makes calls to SNS and deletes SQS message if graph is in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              buyoutEvent: {
                lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
                loan: subgraphLoanCopy,
              },
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).toHaveBeenCalledTimes(1);
        expect(mockedSnsPushCall).toHaveBeenCalledWith(subgraphLoanCopy);

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });
    });

    describe('LendEvent', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: 'LendEvent',
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              lendEvent: null,
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).not.toHaveBeenCalled;
        expect(mockedSqsDeleteMessageCall).not.toHaveBeenCalled;
      });

      it('makes calls to SNS and deletes SQS message if graph is in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              lendEvent: {
                borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
                loan: subgraphLoanCopy,
              },
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).toHaveBeenCalledTimes(1);
        expect(mockedSnsPushCall).toHaveBeenCalledWith(subgraphLoanCopy);

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });
    });
    describe('RepaymentEvent', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: 'RepaymentEvent',
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              repaymentEvent: null,
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).not.toHaveBeenCalled;
        expect(mockedSqsDeleteMessageCall).not.toHaveBeenCalled;
      });

      it('makes calls to SNS and deletes SQS message if graph is in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              repaymentEvent: {
                lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
                loan: subgraphLoanCopy,
              },
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).toHaveBeenCalledTimes(1);
        expect(mockedSnsPushCall).toHaveBeenCalledWith(subgraphLoanCopy);

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });
    });
    describe('CollateralSeizureEvent', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: 'CollateralSeizureEvent',
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              collateralSeizureEvent: null,
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).not.toHaveBeenCalled;
        expect(mockedSqsDeleteMessageCall).not.toHaveBeenCalled;
      });

      it('makes calls to SNS and deletes SQS message if graph is in sync', async () => {
        mockedNftBackedLoansClientQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              collateralSeizureEvent: {
                borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
                loan: subgraphLoanCopy,
              },
            },
          }),
        } as any);
        await main();
        expect(mockedSnsPushCall).toHaveBeenCalledTimes(1);
        expect(mockedSnsPushCall).toHaveBeenCalledWith(subgraphLoanCopy);

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });
    });
  });
});
