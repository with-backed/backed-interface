import { AllowButton, Button, CompletedButton } from 'components/Button';
import { ethers } from 'ethers';
import { ErrorMessage, Field, Formik } from 'formik';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { Loan } from 'lib/types/Loan';
import React, { useMemo, useState } from 'react';
import * as Yup from 'yup';
import styles from './LoanForm.module.css';

type LoanFormAwaitingProps = {
  loan: Loan;
  balance: number;
  needsAllowance: boolean;
};
export function LoanFormAwaiting({
  loan,
  balance,
  needsAllowance,
}: LoanFormAwaitingProps) {
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
  const [allowed, setAllowed] = useState(!needsAllowance);

  return (
    <Formik
      initialValues={{
        amount: initialAmount,
        interestRate: initialInterestRate,
        duration: initialDuration,
      }}
      validationSchema={Yup.object({
        amount: Yup.number().min(initialAmount).max(balance),
        interestRate: Yup.number().min(initialInterestRate),
        duration: Yup.number().min(initialDuration),
      })}
      onSubmit={console.log}>
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
            callback={() => setAllowed(true)}
          />
          <Button disabled={!allowed} type="submit">
            Lend
          </Button>
        </form>
      )}
    </Formik>
  );
}
