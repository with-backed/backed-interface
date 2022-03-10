import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import { nftBackedLoansClient } from 'lib/urql';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/consumers/userNotifications';
import fetchMock from 'jest-fetch-mock';

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

const txHash = 'random-tx-hash';

const mockedNftBackedLoansClientQuery =
  nftBackedLoansClient.query as jest.MockedFunction<
    typeof nftBackedLoansClient.query
  >;

jest.mock('lib/events/consumers/userNotifications/emails', () => ({
  sendEmailsForTriggerAndEntity: jest.fn(),
}));

const mockedSendEmailCall =
  sendEmailsForTriggerAndEntity as jest.MockedFunction<
    typeof sendEmailsForTriggerAndEntity
  >;

describe('/api/events/consumers/userNotifications', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('SNS subscription confirmation', () => {
    beforeEach(() => {});
    it('successfully makes a GET request to the subscribe url passed when SubscribeURL is passed to body', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          SubscribeURL: 'https://example.com',
        },
      });
      req.body = JSON.stringify(req.body);

      fetchMock.mockResponse('success');
      await handler(req, res);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith('https://example.com', {
        method: 'GET',
      });
      expect(sendEmailsForTriggerAndEntity).not.toHaveBeenCalled;

      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(`subscription successful`);
    });
  });

  describe('BuyoutEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          Message: JSON.stringify({
            eventName: 'BuyoutEvent',
            event: {
              lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
              loan: subgraphLoanCopy,
            },
            txHash,
          }),
        },
      });
      req.body = JSON.stringify(req.body);

      await handler(req, res);

      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
        'BuyoutEvent',
        expect.objectContaining({
          lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
          loan: subgraphLoanCopy,
        }),
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
          Message: JSON.stringify({
            eventName: 'LendEvent',
            event: {
              borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
              loan: subgraphLoanCopy,
            },
            txHash,
          }),
        },
      });
      req.body = JSON.stringify(req.body);

      await handler(req, res);

      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
        'LendEvent',
        expect.objectContaining({
          borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
        }),
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
          Message: JSON.stringify({
            eventName: 'LendEvent',
            event: {
              lendTicketHolder: subgraphLoanCopy.borrowTicketHolder,
              loan: subgraphLoanCopy,
            },
            txHash,
          }),
        },
      });
      req.body = JSON.stringify(req.body);

      await handler(req, res);

      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
        'LendEvent',
        expect.objectContaining({
          lendTicketHolder: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
        }),
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
          Message: JSON.stringify({
            eventName: 'RepaymentEvent',
            event: {
              lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
              loan: subgraphLoanCopy,
            },
            txHash,
          }),
        },
      });
      req.body = JSON.stringify(req.body);

      await handler(req, res);

      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
        'RepaymentEvent',
        expect.objectContaining({
          lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
          loan: subgraphLoanCopy,
        }),
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
          Message: JSON.stringify({
            eventName: 'CollateralSeizureEvent',
            event: {
              lendTicketHolder: subgraphLoanCopy.borrowTicketHolder,
              loan: subgraphLoanCopy,
            },
            txHash,
          }),
        },
      });
      req.body = JSON.stringify(req.body);

      await handler(req, res);

      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(1);
      expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
        'CollateralSeizureEvent',
        expect.objectContaining({
          lendTicketHolder: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
        }),
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });
});
