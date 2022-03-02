import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { sendEmail } from 'lib/notifications/emails';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import {
  NotificationEventTrigger,
  NotificationMethod,
} from 'lib/notifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/[event]';

const subgraphLoanCopy = Object.assign({}, subgraphLoan);
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const event = NotificationEventTrigger.ALL;
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

const notificationReqBorrower: NotificationRequest = {
  id: 1,
  ethAddress: subgraphLoanCopy.borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqLender: NotificationRequest = {
  id: 1,
  ethAddress: subgraphLoanCopy.lendTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

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

const mockedSendEmailCall = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/events/cron/[event]', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValueOnce([notificationReqBorrower]);
    mockedGetNotificationsCall.mockResolvedValueOnce([notificationReqLender]);
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('LiquidationOccurringBorrower', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccurringBorrower',
        },
        body: {
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
        NotificationEventTrigger.LiquidationOccurringBorrower,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('LiquidationOccurringLender', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccurringLender',
        },
        body: {
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
        NotificationEventTrigger.LiquidationOccurringLender,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('LiquidationOccurredBorrower', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccurredBorrower',
        },
        body: {
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
        NotificationEventTrigger.LiquidationOccurredBorrower,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('LiquidationOccurredLender', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccurredLender',
        },
        body: {
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
        NotificationEventTrigger.LiquidationOccurredLender,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });
});
