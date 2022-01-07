import { TransactionButton } from 'components/Button';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from 'lib/contracts';
import React, { useCallback, useState } from 'react';
import { Loan } from 'types/Loan';
import styles from './LoanForm.module.css';

type LoanFormEarlyClosureProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanFormEarlyClosure({
  loan,
  refresh,
}: LoanFormEarlyClosureProps) {
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const close = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator();
    const t = await loanFacilitator.closeLoan(loan.id, loan.borrower);
    setIsPending(true);
    setTxHash(t.hash);

    t.wait()
      .then(() => {
        const loanFacilitator = jsonRpcLoanFacilitator();
        const filter = loanFacilitator.filters.Close(loan.id);
        loanFacilitator.once(filter, () => {
          setIsPending(false);
          refresh();
        });
      })
      .catch((err) => {
        setIsPending(false);
        console.error(err);
      });
  }, [loan.id, loan.borrower, refresh]);

  return (
    <div className={styles.form}>
      <TransactionButton
        text="Close this loan"
        txHash={txHash}
        isPending={isPending}
        onClick={close}
      />
    </div>
  );
}
