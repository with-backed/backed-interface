import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import {
  createNotificationRequestForAddress,
  deleteAllNotificationRequestsForAddress,
  getNumberOfRequestsForNotificationDestination,
} from 'lib/notifications/repository';
import {
  NotificationEventTrigger,
  NotificationMethod,
} from 'lib/notifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/addresses/[address]/notifications/emails/[email]';

const event = NotificationEventTrigger.ALL;
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

jest.mock('lib/notifications/repository', () => ({
  createNotificationRequestForAddress: jest.fn(),
  deleteAllNotificationRequestsForAddress: jest.fn(),
  getNumberOfRequestsForNotificationDestination: jest.fn(),
}));

const mockedCreateDBCall =
  createNotificationRequestForAddress as jest.MockedFunction<
    typeof createNotificationRequestForAddress
  >;

const mockedDeleteDBCall =
  deleteAllNotificationRequestsForAddress as jest.MockedFunction<
    typeof deleteAllNotificationRequestsForAddress
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
        id: 1,
        ethAddress: address,
        deliveryDestination: notificationDestination,
        deliveryMethod: notificationMethod,
        event,
      };
    });
    it('makes a call to prisma repository and returns 200 on POST', async () => {
      mockedGetReqCountCall.mockResolvedValue(1);
      mockedCreateDBCall.mockResolvedValue(expectedNotificationRequest);

      const { req, res } = createMocks({
        method: 'POST',
        query: {
          address,
          email: notificationDestination,
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
    });

    it('makes a call to prisma repository and returns 200 on DELETE', async () => {
      mockedDeleteDBCall.mockResolvedValue(true);
      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          address,
          email: notificationDestination,
        },
        body: {
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(mockedDeleteDBCall).toBeCalledTimes(1);
      expect(mockedDeleteDBCall).toHaveBeenCalledWith(address);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications for address ${address} deleted successfully`,
      );
    });

    it('returns a 400 if an email has tried to subscribe to more than 5 addresses', async () => {
      mockedGetReqCountCall.mockResolvedValue(6);
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          address,
          email: notificationDestination,
        },
        body: {
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        'you can only subscribe to 5 addresses per email address',
      );
    });
  });
});
