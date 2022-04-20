import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { ethers } from 'ethers';
import { secondsBigNumToDays } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import React, { useCallback } from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import { Loan } from 'types/Loan';

type ExplainerProps = {
  form: UseFormReturn<LoanFormData, object>;
  loan: Loan;
  state: string;
  top: number;
};

type InnerProps = {
  context: LoanFormData;
  loan: Loan;
};

const explainers: {
  [key: string]: (props: InnerProps) => JSX.Element;
} = {
  Lend,
  LendPending,
  LendSuccess,
  LendTermsUnfocused,
  loanAmount: LoanAmount,
  duration: Duration,
  interestRate: InterestRate,
};

export function Explainer({ form, loan, state, top }: ExplainerProps) {
  const error = Object.values(form.formState.errors)[0];
  const Inner = explainers[state];

  return (
    <ExplainerWrapper top={top} display={!!error ? 'error' : 'normal'}>
      {!!error && <Error error={error} />}
      {!error && <Inner context={form.watch()} loan={loan} />}
    </ExplainerWrapper>
  );
}

function Error({ error }: { error: FieldError }) {
  return (
    <>
      🚧
      <div role="alert">{error.message}</div>
    </>
  );
}

function LendTermsUnfocused({ loan }: InnerProps) {
  return (
    <div>
      <p style={{ marginTop: 0 }}>
        You can become the lender on this loan by offering better terms. Improve
        one term by at least 10%.
      </p>
      {!loan.allowLoanAmountIncrease && (
        <p style={{ marginBottom: 0 }}>
          The borrower has locked the loan amount and it cannot be increased
        </p>
      )}
    </div>
  );
}

function Lend() {
  return (
    <div>
      Before you deposit funds, take a minute to verify that this NFT is legit.
      Check its collection and trading history on <b>OpenSea</b> to make sure
      it&apos;s not a fraud.
    </div>
  );
}

function LendPending() {
  return <div>This can take a few minutes.</div>;
}

function LendSuccess() {
  return <div>You are now the lender on this loan!</div>;
}

function LoanAmount({ loan }: InnerProps) {
  const minimumImprovement = loan.loanAmount.div(10).add(loan.loanAmount);
  const formatAmount = useCallback(
    (amount: ethers.BigNumber) => {
      return ethers.utils.formatUnits(amount, loan.loanAssetDecimals);
    },
    [loan.loanAssetDecimals],
  );
  return (
    <div>
      The current loan amount is {formatAmount(loan.loanAmount)}{' '}
      {loan.loanAssetSymbol}. To improve by 10%, lend a higher amount, at least{' '}
      {formatAmount(minimumImprovement)} {loan.loanAssetSymbol}.
    </div>
  );
}

function Duration({ loan }: InnerProps) {
  const minimumImprovement = loan.durationSeconds
    .div(10)
    .add(loan.durationSeconds);
  return (
    <div>
      The current duration is {secondsBigNumToDays(loan.durationSeconds)} days.
      To improve by 10%, lend for a longer duration, at least{' '}
      {secondsBigNumToDays(minimumImprovement)} days.
    </div>
  );
}

function InterestRate({ loan }: InnerProps) {
  const minimumImprovement = loan.perAnumInterestRate.sub(
    loan.perAnumInterestRate.div(10),
  );
  return (
    <div>
      The current interest rate is{' '}
      {formattedAnnualRate(loan.perAnumInterestRate)} %. To improve by 10%, lend
      at a lower rate, at most {formattedAnnualRate(minimumImprovement)} %.
    </div>
  );
}
