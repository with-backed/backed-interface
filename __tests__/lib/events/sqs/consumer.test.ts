import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { main } from 'lib/events/sqs/consumer';
import { pushEventForProcessing } from 'lib/events/sns/push';
import { deleteMessage, receiveMessages } from 'lib/events/sqs/helpers';
import { nftBackedLoansClientFromConfig } from 'lib/urql';
import { subgraphLendEvent } from 'lib/mockSubgraphEventsData';
import { getMostRecentTermsForLoan } from 'lib/loans/subgraph/subgraphLoans';
import { configs } from 'lib/config';

const subgraphLoanCopy = {
  ...subgraphLoan,
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

jest.mock('lib/events/sqs/helpers', () => ({
  receiveMessages: jest.fn(),
  deleteMessage: jest.fn(),
}));

jest.mock('lib/events/sns/push', () => ({
  pushEventForProcessing: jest.fn(),
}));

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClientFromConfig: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

const client = nftBackedLoansClientFromConfig(configs.rinkeby);

const mockedNFTBackedLoansClientFromConfig =
  nftBackedLoansClientFromConfig as jest.MockedFunction<
    typeof nftBackedLoansClientFromConfig
  >;

const mockedQuery = client.query as jest.MockedFunction<typeof client.query>;

const mockedSqsReceiveCall = receiveMessages as jest.MockedFunction<
  typeof receiveMessages
>;
const mockedSqsDeleteMessageCall = deleteMessage as jest.MockedFunction<
  typeof deleteMessage
>;
const mockedSnsPushCall = pushEventForProcessing as jest.MockedFunction<
  typeof pushEventForProcessing
>;

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getMostRecentTermsForLoan: jest.fn(),
}));

const mockedRecentTermsEvent = getMostRecentTermsForLoan as jest.MockedFunction<
  typeof getMostRecentTermsForLoan
>;

describe('SQS consumer', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedNFTBackedLoansClientFromConfig.mockReturnValue(client);
    mockedSnsPushCall.mockResolvedValue(true);
    mockedRecentTermsEvent.mockResolvedValue(undefined);
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
            network: 'rinkeby',
          },
        ]);
        mockedRecentTermsEvent.mockResolvedValue({
          ...subgraphLendEvent,
          loanAmount: '8000000000000000000000',
          timestamp: subgraphLendEvent.timestamp - 86400 * 2,
        });
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedQuery.mockReturnValueOnce({
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
        mockedQuery.mockReturnValueOnce({
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
        expect(mockedSnsPushCall).toHaveBeenCalledWith({
          eventName: 'BuyoutEvent',
          event: expect.objectContaining({
            lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
            loan: subgraphLoanCopy,
          }),
          mostRecentTermsEvent: {
            ...subgraphLendEvent,
            loanAmount: '8000000000000000000000',
            timestamp: subgraphLendEvent.timestamp - 86400 * 2,
          },
          network: 'rinkeby',
        });

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });

      it('does not make call to deleteMessage if push to SNS failed', async () => {
        mockedQuery.mockReturnValueOnce({
          toPromise: async () => ({
            data: {
              buyoutEvent: {
                lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
                loan: subgraphLoanCopy,
              },
            },
          }),
        } as any);
        mockedSnsPushCall.mockResolvedValueOnce(false);

        await main();
        expect(mockedSnsPushCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).not.toHaveBeenCalled;
      });
    });

    describe('LendEvent', () => {
      beforeEach(() => {
        mockedSqsReceiveCall.mockResolvedValueOnce([
          {
            eventName: 'LendEvent',
            txHash: 'random-tx-hash',
            receiptHandle: 'random-receipt-handle',
            network: 'rinkeby',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedQuery.mockReturnValueOnce({
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
        mockedQuery.mockReturnValueOnce({
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
        expect(mockedSnsPushCall).toHaveBeenCalledWith({
          eventName: 'LendEvent',
          event: expect.objectContaining({
            borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
            loan: subgraphLoanCopy,
          }),
          mostRecentTermsEvent: undefined,
          network: 'rinkeby',
        });

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
            network: 'rinkeby',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedQuery.mockReturnValueOnce({
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
        mockedQuery.mockReturnValueOnce({
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
        expect(mockedSnsPushCall).toHaveBeenCalledWith({
          eventName: 'RepaymentEvent',
          event: expect.objectContaining({
            lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
            loan: subgraphLoanCopy,
          }),
          mostRecentTermsEvent: undefined,
          network: 'rinkeby',
        });

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
            network: 'rinkeby',
          },
        ]);
      });
      it('does not make call to deleteMessage or pushEventForProcessing if graph is still not in sync', async () => {
        mockedQuery.mockReturnValueOnce({
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
        mockedQuery.mockReturnValueOnce({
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
        expect(mockedSnsPushCall).toHaveBeenCalledWith({
          eventName: 'CollateralSeizureEvent',
          event: expect.objectContaining({
            borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
            loan: subgraphLoanCopy,
          }),
          mostRecentTermsEvent: undefined,
          network: 'rinkeby',
        });

        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledTimes(1);
        expect(mockedSqsDeleteMessageCall).toHaveBeenCalledWith(
          'random-receipt-handle',
        );
      });
    });
  });
});
