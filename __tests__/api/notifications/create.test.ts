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

  describe('valid signed message', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = await wallet.signMessage(
        ethers.utils.arrayify(
          new Buffer.from(process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!),
        ),
      );
      address = wallet.address;

      mockedCreateDBCall.mockReturnValue(
        new Promise((resolve, reject) => {
          resolve({
            id: 1,
            ethAddress: address,
            deliveryDestination: notificationDestination,
            deliveryMethod: notificationMethod,
            event,
          });
        }),
      );
    });
    it('returns 200 and makes a call to prisma repository on valid signed message + address', async () => {
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
        expect.objectContaining({
          id: 1,
          ethAddress: address,
          deliveryDestination: notificationDestination,
          deliveryMethod: notificationMethod,
          event,
        }),
      );
    });
  });
});
