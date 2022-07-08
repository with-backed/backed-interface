import { act, renderHook } from '@testing-library/react-hooks';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { web3LoanFacilitator } from 'lib/contracts';
import { baseLoan } from 'lib/mockData';
import { EventEmitter } from 'stream';
import { useAccount } from 'wagmi';

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useSigner: jest.fn().mockReturnValue([{ data: jest.fn() }]),
}));

jest.mock('lib/contracts', () => ({
  ...jest.requireActual('lib/contracts'),
  web3LoanFacilitator: jest.fn(),
}));

const mockedUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockedLoanFacilitator = web3LoanFacilitator as jest.MockedFunction<
  typeof web3LoanFacilitator
>;
const refresh = jest.fn();

const underwriteValues = { duration: 5, interestRate: 6, loanAmount: 7 };

// used to control when and how transaction.wait() resolves
const forcePromiseEmitter = new EventEmitter();

const makeTransaction = () => {
  return {
    hash: '0xhash',
    wait: () =>
      new Promise((resolve, reject) => {
        forcePromiseEmitter.on('resolve', () => resolve(true));
        forcePromiseEmitter.on('reject', () => reject('fail'));
      }),
  };
};

describe('useLoanUnderwriter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAccount.mockReturnValue({
      address: '0xmyaddress',
    } as any);
    mockedLoanFacilitator.mockReturnValue({
      lend: jest.fn(),
    } as any);
  });

  it('returns default state before underwriting', () => {
    const { result } = renderHook(() => useLoanUnderwriter(baseLoan, refresh));

    expect(result.current).toEqual({
      underwrite: expect.any(Function),
      txHash: '',
      transactionPending: false,
    });
  });

  it('signals an error if you try to underwrite before having an account', async () => {
    mockedUseAccount.mockReturnValue([{ data: { address: undefined } }] as any);

    const { result } = renderHook(() => useLoanUnderwriter(baseLoan, refresh));

    const { underwrite } = result.current;
    try {
      await underwrite(underwriteValues);
      // intended to fail
      expect(true).toBe(false);
    } catch (e) {
      expect((e as any).message).toEqual(
        'Cannot underwrite a loan without a connected account',
      );
    }
  });

  it('underwrites a loan', async () => {
    const transaction = makeTransaction();
    mockedLoanFacilitator.mockReturnValue({
      lend: jest.fn().mockResolvedValue(transaction),
    } as any);

    const { result } = renderHook(() => useLoanUnderwriter(baseLoan, refresh));

    const { underwrite } = result.current;
    await act(async () => {
      await underwrite(underwriteValues);
    });

    expect(result.current.txHash).toEqual('0xhash');
    expect(result.current.transactionPending).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();

    await act(async () => {
      forcePromiseEmitter.emit('resolve');
    });

    expect(result.current.transactionPending).toBeFalsy();
    expect(refresh).toHaveBeenCalled();
  });

  it('handles failure to underwrite a loan', async () => {
    const transaction = makeTransaction();
    mockedLoanFacilitator.mockReturnValue({
      lend: jest.fn().mockResolvedValue(transaction),
    } as any);

    const { result } = renderHook(() => useLoanUnderwriter(baseLoan, refresh));

    const { underwrite } = result.current;
    await act(async () => {
      await underwrite(underwriteValues);
    });

    expect(result.current.txHash).toEqual('0xhash');
    expect(result.current.transactionPending).toBeTruthy();

    await act(async () => {
      forcePromiseEmitter.emit('reject');
    });

    expect(result.current.transactionPending).toBeFalsy();
  });
});
