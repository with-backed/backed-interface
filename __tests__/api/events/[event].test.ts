import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { sendEmail } from 'lib/notifications/emails';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import {
  NotificationEventTrigger,
  NotificationMethod,
} from 'lib/notifications/shared';
import { nftBackedLoansClient } from 'lib/urql';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/[event]';

const subgraphLoanCopy = {
  ...subgraphLoan,
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const event = NotificationEventTrigger.ALL;
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

const returnedNotificationRequest: NotificationRequest = {
  id: 1,
  ethAddress: '', // we don't care what this is for these tests
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClient: {
    query: jest.fn(),
  },
}));

jest.mock('lib/notifications/emails', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('lib/notifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

const mockedGetNotificationsCall =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const mockedNftBackedLoansClientQuery =
  nftBackedLoansClient.query as jest.MockedFunction<
    typeof nftBackedLoansClient.query
  >;

const mockedSendEmailCall = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/events/[event]', () => {
  const txHash = 'random-hash';

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([returnedNotificationRequest]);
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('BuyoutEventOldLender', () => {
    beforeEach(async () => {
      mockedNftBackedLoansClientQuery.mockReturnValue({
        toPromise: async () => ({
          data: {
            buyoutEvent: {
              lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
              loan: subgraphLoanCopy,
            },
          },
        }),
      } as any);
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'BuyoutEventOldLender',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.lendTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.BuyoutEventOldLender,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
      );
    });
  });

  describe('BuyoutEventBorrower', () => {
    beforeEach(async () => {
      mockedNftBackedLoansClientQuery.mockReturnValue({
        toPromise: async () => ({
          data: {
            buyoutEvent: {
              lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
              loan: subgraphLoanCopy,
            },
          },
        }),
      } as any);
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'BuyoutEventBorrower',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.BuyoutEventBorrower,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });

  describe('LendEvent', () => {
    beforeEach(async () => {
      mockedNftBackedLoansClientQuery.mockReturnValue({
        toPromise: async () => ({
          data: {
            lendEvent: {
              borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
              loan: subgraphLoanCopy,
            },
          },
        }),
      } as any);
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LendEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.LendEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });

  describe('RepaymentEvent', () => {
    beforeEach(async () => {
      mockedNftBackedLoansClientQuery.mockReturnValue({
        toPromise: async () => ({
          data: {
            repaymentEvent: {
              lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
              loan: subgraphLoanCopy,
            },
          },
        }),
      } as any);
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'RepaymentEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.lendTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.RepaymentEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    beforeEach(async () => {
      mockedNftBackedLoansClientQuery.mockReturnValue({
        toPromise: async () => ({
          data: {
            collateralSeizureEvent: {
              borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
              loan: subgraphLoanCopy,
            },
          },
        }),
      } as any);
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'CollateralSeizureEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.CollateralSeizureEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });
});
