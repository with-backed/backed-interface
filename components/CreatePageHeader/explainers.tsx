import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import React from 'react';
import styles from './CreatePageHeader.module.css';

export type ExplainerContext = {
  interestRate: number | null;
};
type ExplainerProps = {
  context: ExplainerContext;
};

export const explainers = {
  noWallet: NoWallet,
  selectNFT: SelectNFT,
  authorizeNFT: AuthorizeNFT,
  pendingAuthorization: PendingAuthorization,
  loanFormUnfocused: LoanFormUnfocused,
  denomination: Denomination,
  loanAmount: LoanAmount,
  minimumDuration: MinimumDuration,
  maximumInterestRate: MaximumInterestRate,
};

function NoWallet({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      First, connect a wallet. Then, follow these steps to create a loan and
      make it available to lenders.
    </div>
  );
}

function SelectNFT({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      Follow these steps to create a loan and make it available to lenders.
    </div>
  );
}

function AuthorizeNFT({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      This allows the Pawn Shop to move your NFT and to trasnfer it to the
      lender if you do not repay your loan.
    </div>
  );
}

function PendingAuthorization({ context }: ExplainerProps) {
  return <div className={styles.explainer}>This can take a few minutes.</div>;
}

function LoanFormUnfocused({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      Set your loan terms. Any lender who wishes can meet these terms, and you
      will automatically receive the loan amount minus a 1% origination fee.
    </div>
  );
}

function Denomination({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      This is the token used for the loan principal, interest, and repayment.
    </div>
  );
}

function LoanAmount({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      Lenders can give you a larger loan, but this is the minimum amount
      you&apos;ll accept.
    </div>
  );
}

function MinimumDuration({ context }: ExplainerProps) {
  return (
    <div className={styles.explainer}>
      Lenders can give you a longer loan and reset the duration, but this is the
      minimum length of a loan you&apos;ll accept.
    </div>
  );
}

const SECONDS_IN_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;

function MaximumInterestRate({ context }: ExplainerProps) {
  if (context.interestRate) {
    const interestRatePerSecond = ethers.BigNumber.from(
      Math.floor(context.interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
    ).div(SECONDS_IN_YEAR);
    return (
      <div className={styles.explainer}>
        Because interest is stored and calculated per second instead of
        annually, the loan ticket will show an APR of{' '}
        {formattedAnnualRate(interestRatePerSecond)}%.
        <br />
        The estimated repayment will be XXX DAI on [DATE].
      </div>
    );
  }
  return (
    <div className={styles.explainer}>
      Lenders can give you a lower interest rate, but this is the maximum
      interest rate you&apos;ll pay.
    </div>
  );
}
