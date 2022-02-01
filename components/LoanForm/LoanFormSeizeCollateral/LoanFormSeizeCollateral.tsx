import { TransactionButton } from 'components/Button';
import { Form } from 'components/Form';
import { web3LoanFacilitator } from 'lib/contracts';
import React, { useCallback, useState } from 'react';
import { Loan } from 'types/Loan';

type LoanFormSeizeCollateralProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanFormSeizeCollateral({
  loan,
  refresh,
}: LoanFormSeizeCollateralProps) {
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const seize = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator();
    const t = await loanFacilitator.seizeCollateral(loan.id, loan.lender!);
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
  }, [loan.id, loan.lender, refresh]);

  return (
    <Form>
      <TransactionButton
        text="Seize collateral"
        txHash={txHash}
        isPending={isPending}
        onClick={seize}
      />
    </Form>
  );
}
