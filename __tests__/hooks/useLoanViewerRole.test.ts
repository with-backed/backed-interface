import { renderHook } from '@testing-library/react-hooks';
import { useLoanViewerRole } from 'hooks/useLoanViewerRole';
import { baseLoan, loanWithLenderAccruing } from 'lib/mockData';

const borrower = '0x143b357C6f9E029991A7eE10259B3a888191e408';
const lender = '0x141B3B7862E2C2e3410039d9fe7F2617E98E7992';
const neitherLenderNorBorrower = '0x6acB8F94DD966fd28014305387093B4b3252A00f';

describe('useLoanViewerRole', () => {
  it('renders borrower role', () => {
    const result = renderHook(() =>
      useLoanViewerRole({ ...baseLoan, borrower }, borrower),
    );
    expect(result.result.current).toEqual('borrower');
  });

  it('renders lender role', () => {
    const result = renderHook(() =>
      useLoanViewerRole({ ...loanWithLenderAccruing, lender }, lender),
    );
    expect(result.result.current).toEqual('lender');
  });

  it('renders null for null account', () => {
    const result = renderHook(() => useLoanViewerRole(baseLoan, null));
    expect(result.result.current).toEqual(null);
  });

  it('renders null for undefined account', () => {
    const result = renderHook(() => useLoanViewerRole(baseLoan, undefined));
    expect(result.result.current).toEqual(null);
  });

  it('renders null for null lender', () => {
    const result = renderHook(() => useLoanViewerRole(baseLoan, lender));
    expect(result.result.current).toEqual(null);
  });

  it('renders null for account that is neither the lender nor borrower for a loan with a lender', () => {
    const result = renderHook(() =>
      useLoanViewerRole(
        { ...loanWithLenderAccruing, lender },
        neitherLenderNorBorrower,
      ),
    );
    expect(result.result.current).toEqual(null);
  });

  it('renders null for account that is neither the lender nor borrower for a loan with no lender', () => {
    const result = renderHook(() =>
      useLoanViewerRole(baseLoan, neitherLenderNorBorrower),
    );
    expect(result.result.current).toEqual(null);
  });
});
