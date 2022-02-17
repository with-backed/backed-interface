import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { sendEmail } from 'lib/notifications/emails';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import {
  NotificationEventTrigger,
  NotificationMethod,
} from 'lib/notifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/[event]';

const borrowTicketHolder = ethers.Wallet.createRandom().address.toLowerCase();
const lendTicketHolder = ethers.Wallet.createRandom().address.toLowerCase();

const event = NotificationEventTrigger.ALL;
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

const notificationReqBorrower: NotificationRequest = {
  id: 1,
  ethAddress: borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqLender: NotificationRequest = {
  id: 1,
  ethAddress: lendTicketHolder,
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
  const txHash = 'random-hash';

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockReturnValueOnce(
      new Promise((resolve, _reject) => {
        resolve([notificationReqBorrower]);
      }),
    );
    mockedGetNotificationsCall.mockReturnValueOnce(
      new Promise((resolve, _reject) => {
        resolve([notificationReqLender]);
      }),
    );
    mockedSendEmailCall.mockReturnValue();
  });

  describe('LiquidationOccuring', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccuring',
        },
        body: {
          borrowTicketHolder,
          lendTicketHolder,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(lendTicketHolder);

      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.LiquidationOccuring,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });

  describe('LiquidationOccured', () => {
    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LiquidationOccured',
        },
        body: {
          borrowTicketHolder,
          lendTicketHolder,
        },
      });

      await handler(req, res);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(lendTicketHolder);

      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.LiquidationOccured,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent`,
      );
    });
  });
});
