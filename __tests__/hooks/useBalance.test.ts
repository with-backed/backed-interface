import { renderHook } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { useBalance } from 'hooks/useBalance';
import { useTimestamp } from 'hooks/useTimestamp';
import { configs } from 'lib/config';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { useAccount } from 'wagmi';

jest.mock('hooks/useTimestamp', () => ({
  ...jest.requireActual('hooks/useTimestamp'),
  useTimestamp: jest.fn(),
}));

jest.mock('lib/contracts', () => ({
  ...jest.requireActual('lib/contracts'),
  jsonRpcERC20Contract: jest.fn(),
}));

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
}));

const mockJsonRpcERC20Contract = jsonRpcERC20Contract as jest.MockedFunction<
  typeof jsonRpcERC20Contract
>;
const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockUseTimestamp = useTimestamp as jest.MockedFunction<
  typeof useTimestamp
>;

mockJsonRpcERC20Contract.mockReturnValue({
  balanceOf: jest
    .fn()
    .mockResolvedValue(ethers.BigNumber.from('1500000000000000000')),
  decimals: jest.fn().mockResolvedValue(ethers.BigNumber.from(18)),
} as any);
mockUseTimestamp.mockReturnValue(42);
mockUseAccount.mockReturnValue({ address: '0xmyaddress' } as any);

describe('useBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns zero as a default value', () => {
    mockUseAccount.mockReturnValueOnce({} as any);
    const { result } = renderHook(() => useBalance('0xcontract'));

    expect(result.current).toEqual(0);
    expect(mockJsonRpcERC20Contract).not.toHaveBeenCalled();
  });

  it('returns the balance after querying', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBalance('0xcontract'),
    );

    await waitForNextUpdate();

    expect(result.current).toEqual(1.5);
    expect(mockJsonRpcERC20Contract).toHaveBeenCalledWith(
      '0xcontract',
      configs.rinkeby.jsonRpcProvider,
      'rinkeby',
    );
  });
});
