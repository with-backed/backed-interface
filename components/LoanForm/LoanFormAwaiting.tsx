import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { ethers } from 'ethers';
import { ErrorMessage, Field, Formik } from 'formik';
import { useWeb3 } from 'hooks/useWeb3';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from 'lib/contracts';
import { daysToSecondsBigNum, secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { Loan } from 'lib/types/Loan';
import React, { useCallback, useMemo, useState } from 'react';
import * as Yup from 'yup';
import styles from './LoanForm.module.css';

const SECONDS_IN_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;

interface Values {
  amount: number;
  duration: number;
  interestRate: number;
}

type LoanFormAwaitingProps = {
  loan: Loan;
  balance: number;
  needsAllowance: boolean;
  setNeedsAllowance: (value: boolean) => void;
  refresh: () => void;
};
export function LoanFormAwaiting({
  loan,
  balance,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormAwaitingProps) {
  const { account } = useWeb3();
  const initialAmount = useMemo(
    () =>
      parseFloat(
        ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals),
      ),
    [loan.loanAmount, loan.loanAssetDecimals],
  );
  const initialInterestRate = useMemo(
    () => parseFloat(formattedAnnualRate(loan.perSecondInterestRate)),
    [loan.perSecondInterestRate],
  );
  const initialDuration = useMemo(
    () => secondsBigNumToDays(loan.durationSeconds),
    [loan.durationSeconds],
  );
  const [txHash, setTxHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);
  const handleSubmit = useCallback(
    async ({ amount, duration, interestRate }: Values) => {
      const loanFacilitator = web3LoanFacilitator();
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_YEAR);

      const t = await loanFacilitator.underwriteLoan(
        loan.id,
        interestRatePerSecond,
        ethers.utils.parseUnits(amount.toString(), loan.loanAssetDecimals),
        daysToSecondsBigNum(duration),
        account!,
      );

      setTransactionPending(true);
      setTxHash(t.hash);
      t.wait()
        .then(() => {
          const loanFacilitator = jsonRpcLoanFacilitator();
          const filter = loanFacilitator.filters.UnderwriteLoan(
            loan.id,
            account,
          );
          loanFacilitator.once(filter, () => {
            setTransactionPending(false);
            refresh();
          });
        })
        .catch((err) => {
          setTransactionPending(false);
          console.error(err);
        });
    },
    [account, loan.id, loan.loanAssetDecimals, refresh],
  );

  return (
    <Formik
      initialValues={{
        amount: initialAmount,
        interestRate: initialInterestRate,
        duration: initialDuration,
      }}
      validationSchema={Yup.object({
        amount: Yup.number().min(initialAmount).max(balance),
        interestRate: Yup.number().max(initialInterestRate),
        duration: Yup.number().min(initialDuration),
      })}
      onSubmit={handleSubmit}>
      {(formik) => (
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <CompletedButton buttonText="Lend against this NFT" />

          <label htmlFor="amount">
            <span>Amount ({loan.loanAssetSymbol})</span>
            <Field name="amount" />
          </label>
          <ErrorMessage name="amount" />

          <label htmlFor="interestRate">
            <span>Interest Rate</span>
            <Field name="interestRate" />
          </label>
          <ErrorMessage name="interestRate" />

          <label htmlFor="duration">
            <span>Duration (Days)</span>
            <Field name="duration" />
          </label>
          <ErrorMessage name="duration" />
          <AllowButton
            contractAddress={loan.loanAssetContractAddress}
            symbol={loan.loanAssetSymbol}
            callback={() => setNeedsAllowance(false)}
            done={!needsAllowance}
          />
          <TransactionButton
            text="Lend"
            type="submit"
            txHash={txHash}
            isPending={transactionPending}
            disabled={needsAllowance}
          />
        </form>
      )}
    </Formik>
  );
}
