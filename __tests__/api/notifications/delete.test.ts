import { ethers } from 'ethers';
import { deleteAllNotificationRequestsForAddress } from 'lib/notifications/repository';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/notifications/delete';

jest.mock('lib/notifications/repository', () => ({
  deleteAllNotificationRequestsForAddress: jest.fn(),
}));

const mockedCreateDBCall =
  deleteAllNotificationRequestsForAddress as jest.MockedFunction<
    typeof deleteAllNotificationRequestsForAddress
  >;

describe('/api/notifications/delete', () => {
  let address: string;
  let wallet: ethers.Wallet;
  let sig: string;

  describe('valid signature with matching addresses', () => {
    beforeEach(async () => {
      wallet = ethers.Wallet.createRandom();
      sig = await wallet.signMessage(
        ethers.utils.arrayify(
          Buffer.from(process.env.NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE!),
        ),
      );
      address = wallet.address;

      mockedCreateDBCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve(true);
        }),
      );
    });
    it('makes a call to prisma repository and returns 200', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          address,
          signedMessage: sig,
        },
      });
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications for address ${address} deleted successfully`,
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
        method: 'DELETE',
        body: {
          address,
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
        method: 'DELETE',
        body: {
          address,
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
