import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { sendEmailsForTriggerAndLoan } from 'lib/events/consumers/userNotifications/emails';
import { nftBackedLoansClient } from 'lib/urql';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/consumers/userNotifications';

const subgraphLoanCopy = {
  ...subgraphLoan,
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

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

jest.mock('lib/events/consumers/userNotifications/emails', () => ({
  sendEmailsForTriggerAndLoan: jest.fn(),
}));

const mockedSendEmailCall = sendEmailsForTriggerAndLoan as jest.MockedFunction<
  typeof sendEmailsForTriggerAndLoan
>;

describe('/api/events/[event]', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('BuyoutEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          eventName: 'BuyoutEvent',
          loan: subgraphLoanCopy,
        },
      });

      await handler(req, res);

      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
        'BuyoutEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('LendEvent', () => {
    it('gets notifications associated with address, and sends email when loan does not have previous lender', async () => {
      mockedNftBackedLoansClientQuery.mockReturnValueOnce({
        toPromise: async () => ({
          data: {
            buyoutEvent: null,
          },
        }),
      } as any);
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          eventName: 'LendEvent',
          loan: subgraphLoanCopy,
        },
      });

      await handler(req, res);

      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
        'LendEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });

    it('gets notifications associated with address, and sends email when loan does previous lender', async () => {
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
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          eventName: 'LendEvent',
          loan: subgraphLoanCopy,
        },
      });

      await handler(req, res);

      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
        'LendEvent',
        subgraphLoanCopy,
        true,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('RepaymentEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          eventName: 'RepaymentEvent',
          loan: subgraphLoanCopy,
        },
      });

      await handler(req, res);

      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
        'RepaymentEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          eventName: 'CollateralSeizureEvent',
          loan: subgraphLoanCopy,
        },
      });

      await handler(req, res);

      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
        'CollateralSeizureEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });
});
