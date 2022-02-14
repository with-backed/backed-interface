import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { createNotificationRequestForAddress } from 'lib/notifications/repository';
import { NotificationMethod } from 'lib/notifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/notifications/create';

const event = '';
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

jest.mock('lib/notifications/repository', () => ({
  createNotificationRequestForAddress: jest.fn(),
}));

const mockedCreateDBCall =
  createNotificationRequestForAddress as jest.MockedFunction<
    typeof createNotificationRequestForAddress
  >;

describe('/api/notifications/create', () => {
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
    });
    it('makes a call to prisma repository and returns 200', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          address,
          method: notificationMethod,
          destination: notificationDestination,
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining(expectedNotificationRequest),
      );
    });
  });

  describe('invalid signature', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = 'random-invalid-sig';
      address = wallet.address;
    });
    it('returns 400', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          address,
          method: notificationMethod,
          destination: notificationDestination,
          signedMessage: sig,
        },
      });

      await handler(req, res);

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
    it('returns 400', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          address,
          method: notificationMethod,
          destination: notificationDestination,
          signedMessage: sig,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        'valid signature sent with mismatching addresses',
      );
    });
  });
});
