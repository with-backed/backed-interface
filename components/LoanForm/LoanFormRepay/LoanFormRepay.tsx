import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { Loan } from 'types/Loan';
import React, { useCallback, useState } from 'react';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { web3LoanFacilitator } from 'lib/contracts';
import { Explainer } from './Explainer';
import { Form } from 'components/Form';
import styles from '../LoanForm.module.css';
import { LoanFormDisclosure } from '../LoanFormDisclosure';

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

  const repay = useCallback(async () => {
    const t = await web3LoanFacilitator().repayAndCloseLoan(loan.id);
    setWaitingForTx(true);
    setTxHash(t.hash);
    t.wait()
      .then(() => {
        refresh();
        setWaitingForTx(false);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.error(err);
      });
  }, [loan.id, refresh]);

  return (
    <LoanFormDisclosure
      title={'Repay loan & Claim NFT'}
      renderRightCol={() => <Explainer top={0} />}>
      <Form onSubmit={(e) => e.preventDefault()}>
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
      </Form>
    </LoanFormDisclosure>
  );
}
