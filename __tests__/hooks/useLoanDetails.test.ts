import { renderHook } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { useTimestamp } from 'hooks/useTimestamp';
import { baseLoan } from 'lib/mockData';

jest.mock('hooks/useTimestamp', () => ({
  ...jest.requireActual('hooks/useTimestamp'),
  useTimestamp: jest.fn(),
}));

const mockUseTimestamp = useTimestamp as jest.MockedFunction<
  typeof useTimestamp
>;

describe('useLoanDetails', () => {
  beforeEach(() => {
    mockUseTimestamp.mockReturnValue(42);
  });
  it('renders loan details', () => {
    const result = renderHook(() => useLoanDetails(baseLoan));
    expect(result.result.current.formattedEstimatedPaybackAtMaturity).toEqual(
      '10.0080 DAI',
    );
    expect(result.result.current.formattedInterestAccrued).toEqual('0 DAI');
    expect(result.result.current.formattedInterestRate).toEqual('10%');
    expect(result.result.current.formattedLoanID).toEqual('Loan #8');
    expect(result.result.current.formattedPrincipal).toEqual('10 DAI');
    expect(result.result.current.formattedStatus).toEqual('No lender');
    expect(result.result.current.formattedTimeRemaining).toEqual('--');
    expect(result.result.current.formattedTotalDuration).toEqual('3 days');
    expect(result.result.current.formattedTotalPayback).toEqual('10 DAI');
  });
  it('handles edge-case numbers', () => {
    const result = renderHook(() =>
      useLoanDetails({
        ...baseLoan,
        perAnumInterestRate: ethers.BigNumber.from('0x01'),
      }),
    );
    expect(result.result.current.formattedInterestRate).toEqual('0.1000%');
  });
  it('renders details with placeholder remaining time when timestamp is not available', () => {
    mockUseTimestamp.mockReturnValue(null);
    const result = renderHook(() => useLoanDetails(baseLoan));
    expect(result.result.current.formattedTimeRemaining).toEqual('--');
  });
  it('renders details with indication for past due loan', () => {
    const result = renderHook(() =>
      useLoanDetails({
        ...baseLoan,
        endDateTimestamp: 41,
        durationSeconds: ethers.BigNumber.from(1),
        lastAccumulatedTimestamp: ethers.BigNumber.from(1),
      }),
    );
    expect(result.result.current.formattedStatus).toEqual('Past due');
    expect(result.result.current.formattedTimeRemaining).toEqual('0 days');
  });
  it('renders details with time remaining for accruing loan', () => {
    const result = renderHook(() =>
      useLoanDetails({ ...baseLoan, endDateTimestamp: 1090004 }),
    );
    expect(result.result.current.formattedTimeRemaining).toEqual('12.62 days');
  });
});
