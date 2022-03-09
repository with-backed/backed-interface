import { TransactionButton } from 'components/Button';
import { useWeb3 } from 'hooks/useWeb3';
import { web3LoanFacilitator } from 'lib/contracts';
import React, { useCallback, useState } from 'react';
import { Loan } from 'types/Loan';

type LoanFormEarlyClosureProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanFormEarlyClosure({
  loan,
  refresh,
}: LoanFormEarlyClosureProps) {
  const { library } = useWeb3();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const close = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator(library!);
    const t = await loanFacilitator.closeLoan(loan.id, loan.borrower);
    setIsPending(true);
    setTxHash(t.hash);

    t.wait()
      .then(() => {
        setIsPending(false);
        refresh();
      })
      .catch((err) => {
        setIsPending(false);
        console.error(err);
      });
  }, [library, loan.id, loan.borrower, refresh]);

  return (
    <>
      <TransactionButton
        text="Close this loan"
        txHash={txHash}
        isPending={isPending}
        onClick={close}
      />
    </>
  );
}
