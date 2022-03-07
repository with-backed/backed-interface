import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { sendEmail } from 'lib/events/consumers/userNotifications/emails';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import {
  NotificationTriggerType,
  NotificationMethod,
} from 'lib/events/consumers/userNotifications/shared';
import { nftBackedLoansClient } from 'lib/urql';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/consumers/userNotifications';

const subgraphLoanCopy = {
  ...subgraphLoan,
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const event: NotificationTriggerType = 'All';
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

const mockedNftBackedLoansClientQuery =
  nftBackedLoansClient.query as jest.MockedFunction<
    typeof nftBackedLoansClient.query
  >;

jest.mock('lib/events/consumers/userNotifications/emails', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

const mockedGetNotificationsCall =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const mockedSendEmailCall = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/events/[event]', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([returnedNotificationRequest]);
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('BuyoutEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          event: 'BuyoutEvent',
          involvedAddress: subgraphLoanCopy.lendTicketHolder,
          loan: subgraphLoanCopy,
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
        'BuyoutEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
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
          event: 'LendEvent',
          involvedAddress: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
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
        'LendEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
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
          event: 'LendEvent',
          involvedAddress: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
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
        'LendEvent',
        subgraphLoanCopy,
        true,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });

  describe('RepaymentEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          event: 'RepaymentEvent',
          involvedAddress: subgraphLoanCopy.lendTicketHolder,
          loan: subgraphLoanCopy,
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
        'RepaymentEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    it('gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          event: 'CollateralSeizureEvent',
          involvedAddress: subgraphLoanCopy.borrowTicketHolder,
          loan: subgraphLoanCopy,
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
        'CollateralSeizureEvent',
        subgraphLoanCopy,
        false,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });
});
