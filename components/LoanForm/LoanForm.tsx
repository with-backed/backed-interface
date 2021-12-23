import { Button, CompletedButton } from 'components/Button';
import { ethers } from 'ethers';
import { ErrorMessage, Field, Formik } from 'formik';
import { Loan } from 'lib/types/Loan';
import React, { useCallback, useMemo, useState } from 'react';
import styles from './LoanForm.module.css';
import * as Yup from 'yup';
import { formattedAnnualRate } from 'lib/interest';
import { secondsBigNumToDays } from 'lib/duration';

type LoanFormProps = {
  loan: Loan;
};
export function LoanForm({ loan }: LoanFormProps) {
  const [formOpen, setFormOpen] = useState(false);
  const toggleForm = useCallback(() => setFormOpen((prev) => !prev), []);

  if (!formOpen) {
    return (
      <div className={styles.form}>
        <Button onClick={toggleForm}>Lend against this NFT</Button>
      </div>
    );
  }

  if (loan.closed) {
    return null;
  }

  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return <LoanFormAwaiting loan={loan} />;
  }

  return null;
}

function LoanFormAwaiting({ loan }: LoanFormProps) {
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
  return (
    <Formik
      initialValues={{
        amount: initialAmount,
        interestRate: initialInterestRate,
        duration: initialDuration,
      }}
      validationSchema={Yup.object({
        amount: Yup.number().min(initialAmount),
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

          <Button type="submit">Lend</Button>
        </form>
      )}
    </Formik>
  );
}
