import { renderHook } from '@testing-library/react-hooks';
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
      '10.003888 DAI',
    );
    expect(result.result.current.formattedInterestAccrued).toEqual('0.0 DAI');
    expect(result.result.current.formattedInterestRate).toEqual('4.7304%');
    expect(result.result.current.formattedLoanID).toEqual('Loan #8');
    expect(result.result.current.formattedPrincipal).toEqual('10.0 DAI');
    expect(result.result.current.formattedStatus).toEqual('Awaiting lender');
    expect(result.result.current.formattedTimeRemaining).toEqual(
      'awaiting lender',
    );
    expect(result.result.current.formattedTotalDuration).toEqual('3 days');
    expect(result.result.current.formattedTotalPayback).toEqual('10.0 DAI');
  });
  it('renders details with placeholder remaining time when timestamp is not available', () => {
    mockUseTimestamp.mockReturnValue(null);
    const result = renderHook(() => useLoanDetails(baseLoan));
    expect(result.result.current.formattedTimeRemaining).toEqual('--');
  });
  it('renders details with indication for past due loan', () => {
    const result = renderHook(() =>
      useLoanDetails({ ...baseLoan, endDateTimestamp: 41 }),
    );
    expect(result.result.current.formattedTimeRemaining).toEqual('past due');
  });
  it('renders details with time remaining for accruing loan', () => {
    const result = renderHook(() =>
      useLoanDetails({ ...baseLoan, endDateTimestamp: 1090004 }),
    );
    expect(result.result.current.formattedTimeRemaining).toEqual(
      '13 days left',
    );
  });
});
