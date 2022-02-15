import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import {
  createNotificationRequestForAddress,
  deleteAllNotificationRequestsForAddress,
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
}));

const mockedCreateDBCall =
  createNotificationRequestForAddress as jest.MockedFunction<
    typeof createNotificationRequestForAddress
  >;

const mockedDeleteDBCall =
  deleteAllNotificationRequestsForAddress as jest.MockedFunction<
    typeof deleteAllNotificationRequestsForAddress
  >;

describe('/api/addresses/[address]/notifications/emails/[email]', () => {
  let address: string;
  let wallet: ethers.Wallet;
  let sig: string;
  let expectedNotificationRequest: NotificationRequest;

  describe('valid signature with matching addresses', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = await wallet.signMessage(
        ethers.utils.arrayify(
          Buffer.from(process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!),
        ),
      );
      address = wallet.address;
      expectedNotificationRequest = {
        id: 1,
        ethAddress: address,
        deliveryDestination: notificationDestination,
        deliveryMethod: notificationMethod,
        event,
      };

      mockedCreateDBCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve(expectedNotificationRequest);
        }),
      );
      mockedDeleteDBCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve(true);
        }),
      );
    });
    afterEach(() => {
      mockedCreateDBCall.mockReset();
      mockedDeleteDBCall.mockReset();
    });
    it('makes a call to prisma repository and returns 200 on POST', async () => {
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

      expect(mockedCreateDBCall).toBeCalledTimes(1);
      expect(mockedCreateDBCall).toHaveBeenCalledWith(
        address.toLowerCase(),
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
      expect(mockedDeleteDBCall).toHaveBeenCalledWith(address.toLowerCase());
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications for address ${address.toLowerCase()} deleted successfully`,
      );
    });
  });

  describe('invalid signature', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = 'random-invalid-sig';
      address = wallet.address;
    });
    it('returns 400 on POST', async () => {
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

      expect(mockedCreateDBCall).toBeCalledTimes(0);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual('invalid signature sent');
    });
    it('returns 400 on DELETE', async () => {
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

      expect(mockedDeleteDBCall).toBeCalledTimes(0);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual('invalid signature sent');
    });
  });

  describe('valid signature with mismatching addresses', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = await wallet.signMessage(
        ethers.utils.arrayify(
          Buffer.from(process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!),
        ),
      );
      address = ethers.Wallet.createRandom().address; // use new random address
    });
    it('returns 400 on POST', async () => {
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

      expect(mockedCreateDBCall).toBeCalledTimes(0);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        'valid signature sent with mismatching addresses',
      );
    });
    it('returns 400 on DELETE', async () => {
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

      expect(mockedDeleteDBCall).toBeCalledTimes(0);
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        'valid signature sent with mismatching addresses',
      );
    });
  });
});
