import { ethers } from 'ethers';
import {
  getAccountLoanAssetAllowance,
  getAccountLoanAssetBalance,
  resolveEns,
} from 'lib/account';

jest.mock('lib/contracts', () => ({
  ...jest.requireActual('lib/contracts'),
  jsonRpcERC20Contract: jest.fn().mockReturnValue({
    balanceOf: jest.fn().mockResolvedValue(10000000000),
    allowance: jest.fn().mockResolvedValue(10000000000),
  }),
  web3Erc20Contract: jest.fn().mockReturnValue({
    approve: jest.fn().mockResolvedValue({ hash: '0xhash' }),
  }),
}));

const providerSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider');
providerSpy.mockImplementation(
  () =>
    ({
      resolveName: jest.fn().mockResolvedValue('address.eth'),
    } as any),
);

describe('account utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getAccountLoanAssetBalance', () => {
    it('renders human-readable balance as expected', async () => {
      const value = await getAccountLoanAssetBalance(
        '0xaccount',
        '0xcontract',
        ethers.BigNumber.from(8),
      );
      expect(value).toEqual(100);
    });
  });

  describe('getAccountLoanAssetAllowance', () => {
    it('returns what the contract says the allowance is', async () => {
      const value = await getAccountLoanAssetAllowance(
        '0xaccount',
        '0xcontract',
      );
      expect(value).toEqual(10000000000);
    });
  });

  describe('resolveEns', () => {
    it('returns the value the provider resolves', async () => {
      const value = await resolveEns('0xaddress');
      expect(value).toEqual('address.eth');
    });
  });
});
