import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import React from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import { Loan } from 'types/Loan';

type ExplainerProps = {
  form: UseFormReturn<LoanFormData, object>;
  loan: Loan;
  state: string;
  top: number;
};

type InnerProps = { context: LoanFormData; loan: Loan };

const explainers: {
  [key: string]: (props: InnerProps) => JSX.Element;
} = {
  AuthorizeDai,
  Lend,
  LendPending,
  LendSuccess,
  LendTermsUnfocused,
  Terms,
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

function LendTermsUnfocused({ context }: InnerProps) {
  return (
    <div>
      Meet the terms below to become the Lender on this loan. Your funds will be
      transferred, interest will begin accruing immediately, and you will
      receive a Lender Ticket (NFT) representing your position.
    </div>
  );
}

function AuthorizeDai({}: InnerProps) {
  return (
    <div>
      Allow the Pawn Shop to move your DAI. Funds will not be moved until you
      click &quot;Lend.&quot;
    </div>
  );
}

function Lend({}: InnerProps) {
  return (
    <div>
      Before you deposit funds, take a minute to verify that this NFT is legit.
      Check its collection and trading history on <b>OpenSea</b> to make sure
      it&apos;s not a fraud.
    </div>
  );
}

function LendPending({}: InnerProps) {
  return <div>This can take a few minutes.</div>;
}

function LendSuccess({}: InnerProps) {
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
