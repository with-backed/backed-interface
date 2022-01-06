import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { Loan } from 'types/Loan';
import React, { useCallback, useState } from 'react';
import styles from './LoanForm.module.css';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from 'lib/contracts';

type LoanFormRepayProps = {
  loan: Loan;
  balance: number;
  needsAllowance: boolean;
  setNeedsAllowance: (value: boolean) => void;
  refresh: () => void;
};
export function LoanFormRepay({
  loan,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormRepayProps) {
  const {
    formattedTotalPayback,
    formattedPrincipal,
    formattedInterestAccrued,
  } = useLoanDetails(loan);
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const wait = useCallback(async () => {
    const loanFacilitator = jsonRpcLoanFacilitator();
    const filter = loanFacilitator.filters.Repay(loan.id);
    loanFacilitator.once(filter, () => {
      refresh();
      setWaitingForTx(false);
    });
  }, [loan.id, refresh]);

  const repay = useCallback(async () => {
    const t = await web3LoanFacilitator().repayAndCloseLoan(loan.id);
    setWaitingForTx(true);
    setTxHash(t.hash);
    t.wait()
      .then(() => {
        setTxHash(t.hash);
        setWaitingForTx(true);
        wait();
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.error(err);
      });
  }, [loan.id, wait]);

  return (
    <div className={styles.form}>
      <CompletedButton buttonText="Repay loan & claim NFT" />
      <p>
        The current Payback amount is:
        <br />
        {formattedPrincipal} (principal)
        <br />+ {formattedInterestAccrued} (interest accrued so far)
        <br />= {formattedTotalPayback} Total
        <br />
        “Repay & Claim” will pay this amount, close the loan, and transfer the
        collateral to your wallet.
      </p>
      <AllowButton
        contractAddress={loan.loanAssetContractAddress}
        symbol={loan.loanAssetSymbol}
        callback={() => setNeedsAllowance(false)}
        done={!needsAllowance}
      />
      <TransactionButton
        text="Repay & claim"
        onClick={repay}
        txHash={txHash}
        isPending={waitingForTx}
        disabled={needsAllowance}
      />
    </div>
  );
}
