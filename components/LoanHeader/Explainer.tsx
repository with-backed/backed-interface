import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { secondsBigNumToDays } from 'lib/duration';
import { estimatedRepayment } from 'lib/loans/utils';
import React, { useCallback } from 'react';
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
  NoWallet,
  BetterTermsUnfocused,
  BetterLoanAmount,
  BetterDuration,
  BetterInterestRate,
  AuthorizeDai,
  Lend,
  LendPending,
  LendSuccess,
  LendTermsUnfocused,
  Terms,
  RepayLoan,
  SeizeNFT,
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

function NoWallet({ context }: InnerProps) {
  return (
    <div>
      First, connect a wallet. Then, follow these steps to create a loan and
      make it available to lenders.
    </div>
  );
}

function BetterTermsUnfocused({ context }: InnerProps) {
  return (
    <div>
      You can become the lender on this loan by offing better terms. Improve one
      term by at least 10% — a higher loan amount, a lower interest rate, or a
      longer duration. Click on one to edit.
    </div>
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

function BetterLoanAmount({ loan }: InnerProps) {
  const minimumImprovement = loan.loanAmount.mul(1.1);
  const formatAmount = useCallback(
    (amount: ethers.BigNumber) => {
      return ethers.utils.formatUnits(amount, loan.loanAssetDecimals);
    },
    [loan.loanAssetDecimals],
  );
  return (
    <div>
      The current loan amount is {formatAmount(loan.loanAmount)}. To improve by
      10%, lend a higher amount, at least {formatAmount(minimumImprovement)}.
    </div>
  );
}

function BetterDuration({ loan }: InnerProps) {
  const minimumImprovement = loan.durationSeconds.mul(1.1);
  return (
    <div>
      The current duration is {secondsBigNumToDays(loan.durationSeconds)} days.
      To improve by 10%, lend for a longer duration, at least{' '}
      {secondsBigNumToDays(minimumImprovement)} days.
    </div>
  );
}

function BetterInterestRate({
  context: { duration, interestRate, loanAmount },
  loan,
}: InnerProps) {
  const interestRatePerYear = interestRate
    ? ethers.BigNumber.from(Math.floor(parseFloat(interestRate) * 10))
    : loan.perAnumInterestRate;
  const durationDaysBigNum = duration
    ? ethers.BigNumber.from(parseFloat(duration))
    : loan.durationSeconds;
  const parsedLoanAmount = loanAmount
    ? ethers.utils.parseUnits(loanAmount.toString(), loan.loanAssetDecimals)
    : loan.loanAmount;

  const repayment = estimatedRepayment(
    interestRatePerYear,
    durationDaysBigNum,
    parsedLoanAmount,
  );

  const humanRepayment = parseUnits(
    repayment.toString(),
    loan.loanAssetDecimals,
  );

  return (
    <div>
      The estimated repayment at maturity will be{' '}
      <b>
        {humanRepayment} {loan.loanAssetSymbol}.
      </b>
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

function RepayLoan() {
  return (
    <div>
      ”Repay and claim” will pay this amount, close the loan, and transfer the
      collateral to your wallet.
    </div>
  );
}

function SeizeNFT() {
  return (
    <div>
      Because the Borrower has not repaid the loan, as the Lender you have the
      opportunity to seize the collateral NFT. If you choose to wait, the
      Borrower could still repay, and another Lender could still buy you out.
      Seizing the NFT will close the loan.
    </div>
  );
}
