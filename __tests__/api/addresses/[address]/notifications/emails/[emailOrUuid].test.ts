import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { sendConfirmationEmail } from 'lib/events/consumers/userNotifications/emails/emails';
import {
  createNotificationRequestForAddress,
  deleteNotificationRequestById,
  getNumberOfRequestsForNotificationDestination,
} from 'lib/events/consumers/userNotifications/repository';
import {
  NotificationTriggerType,
  NotificationMethod,
} from 'lib/events/consumers/userNotifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/network/[network]/addresses/[address]/notifications/emails/[emailOrUuid]';

const event: NotificationTriggerType = 'All';
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  createNotificationRequestForAddress: jest.fn(),
  deleteNotificationRequestById: jest.fn(),
  getNumberOfRequestsForNotificationDestination: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/emails/emails', () => ({
  sendConfirmationEmail: jest.fn(),
}));

const mockedConfirmationEmailCall =
  sendConfirmationEmail as jest.MockedFunction<typeof sendConfirmationEmail>;

const mockedCreateDBCall =
  createNotificationRequestForAddress as jest.MockedFunction<
    typeof createNotificationRequestForAddress
  >;

const mockedDeleteDBCall = deleteNotificationRequestById as jest.MockedFunction<
  typeof deleteNotificationRequestById
>;

const mockedGetReqCountCall =
  getNumberOfRequestsForNotificationDestination as jest.MockedFunction<
    typeof getNumberOfRequestsForNotificationDestination
  >;

describe('/api/addresses/[address]/notifications/emails/[email]', () => {
  let address: string;
  let wallet: ethers.Wallet;
  let sig: string;
  let expectedNotificationRequest: NotificationRequest;

  describe('adding and removing an email request', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      wallet = ethers.Wallet.createRandom();
      address = wallet.address;
      expectedNotificationRequest = {
        id: 'some-uuid',
        ethAddress: address,
        deliveryDestination: notificationDestination,
        deliveryMethod: notificationMethod,
        event,
      };
      mockedConfirmationEmailCall.mockResolvedValue();
    });
    it('makes a call to prisma repository, sends confirmation email, and returns 200 on POST', async () => {
      mockedGetReqCountCall.mockResolvedValue(1);
      mockedCreateDBCall.mockResolvedValue(expectedNotificationRequest);

      const { req, res } = createMocks({
        method: 'POST',
        query: {
          address,
          emailOrUuid: notificationDestination,
          network: 'rinkeby',
        },
      });

      await handler(req, res);

      expect(mockedCreateDBCall).toBeCalledTimes(1);
      expect(mockedCreateDBCall).toHaveBeenCalledWith(
        address,
        event,
        notificationMethod,
        notificationDestination,
      );
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining(expectedNotificationRequest),
      );
      expect(mockedConfirmationEmailCall).toHaveBeenCalledTimes(1);
    });

    it('makes a call to prisma repository and returns 200 on DELETE', async () => {
      mockedDeleteDBCall.mockResolvedValue(true);
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          address,
          emailOrUuid: 'some-uuid',
          network: 'rinkeby',
        },
        body: {
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(mockedDeleteDBCall).toBeCalledTimes(1);
      expect(mockedDeleteDBCall).toHaveBeenCalledWith('some-uuid');
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message:
          'notification request with uuid some-uuid deleted successfully',
      });
    });

    it('returns a 400 if an email has tried to subscribe to more than 5 addresses', async () => {
      mockedGetReqCountCall.mockResolvedValue(6);
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          address,
          emailOrUuid: notificationDestination,
          network: 'rinkeby',
        },
        body: {
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'you can only subscribe to 5 addresses per email address',
      });
    });
  });
});
