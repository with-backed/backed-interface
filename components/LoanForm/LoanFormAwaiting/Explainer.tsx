import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import React from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import { Loan } from 'types/Loan';
import styles from 'components/Explainer/Explainer.module.css';

type ExplainerProps = {
  form: UseFormReturn<LoanFormData, object>;
  state: string;
  top: number;
  loan: Loan;
};

type InnerProps = {
  loan: Loan;
};

const explainers: {
  [key: string]: (props: InnerProps) => JSX.Element;
} = {
  LendPending,
  LendSuccess,
  review: Review,
  LendTermsUnfocused,
  loanAmount: Terms,
  duration: Terms,
  interestRate: Terms,
};

export function Explainer({ form, state, top, loan }: ExplainerProps) {
  const error = Object.values(form.formState.errors)[0];
  const Inner = explainers[state];

  return (
    <ExplainerWrapper top={top} display={!!error ? 'error' : 'normal'}>
      {!!error && <Error error={error} />}
      {!error && <Inner loan={loan} />}
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

export function Review() {
  return (
    <div>
      Before proceeding, verify the details of this NFT and ensure it is not a
      fraud. Check its Collection stats and trading history on OpenSea to make
      sure it&lsquo;s not a look-alike.
    </div>
  );
}

function LendTermsUnfocused({ loan }: InnerProps) {
  return (
    <div className={styles['lend-terms-unfocused']}>
      <p style={{ marginTop: 0 }}>
        Meet the terms below to become the Lender on this loan.
      </p>
      {!loan.allowLoanAmountIncrease && (
        <p style={{ marginBottom: 0 }}>
          The borrower has locked the loan amount and it cannot be increased.
        </p>
      )}
      <p>
        Your funds will be transferred, interest will begin accruing
        immediately, and you will receive a Lender Ticket NFT representing your
        position.
      </p>
      <p>
        Later, if another lender buys out this loan by offering better terms,
        you will receive the loan amount plus any interest accrued and your lend
        ticket will be transferred to the new lender.
      </p>
    </div>
  );
}

function LendPending() {
  return <div>This can take a few minutes.</div>;
}

function LendSuccess() {
  return <div>You are now the lender on this loan!</div>;
}

function Terms() {
  return (
    <div>
      You can edit this detail to make the terms better for the borrower, but
      you don&apos;t need to.
    </div>
  );
}
