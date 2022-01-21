import { ethers } from 'ethers';
import { SCALAR } from 'lib/constants';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { daysToSecondsBigNum } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { LoanAsset } from 'lib/loanAssets';
import React, { useEffect, useState } from 'react';
import styles from './CreatePageHeader.module.css';

export type ExplainerContext = {
  interestRate: number | null;
  loanAmount: number | null;
  duration: number | null;
  denomination: LoanAsset | null;
};
type ExplainerProps = {
  context: ExplainerContext;
  state: string;
  top: number;
};

type InnerProps = Pick<ExplainerProps, 'context'>;

export const explainers: {
  [key: string]: (props: InnerProps) => JSX.Element;
} = {
  noWallet: NoWallet,
  selectNFT: SelectNFT,
  authorizeNFT: AuthorizeNFT,
  pendingAuthorization: PendingAuthorization,
  loanFormUnfocused: LoanFormUnfocused,
  denomination: Denomination,
  loanAmount: LoanAmount,
  minimumDuration: MinimumDuration,
  maximumInterestRate: MaximumInterestRate,
  mintBorrowerTicket: MintBorrowerTicket,
  pendingMintBorrowerTicket: PendingMintBorrowerAuthorization,
  mintBorrowerTicketSuccess: MintBorrowerTicketSuccess,
};

export function Explainer({ context, state, top }: ExplainerProps) {
  const Inner = explainers[state];
  return (
    <div className={styles.explainer} style={{ top }}>
      <Inner context={context} />
    </div>
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

function SelectNFT({ context }: InnerProps) {
  return (
    <div>
      Follow these steps to create a loan and make it available to lenders.
    </div>
  );
}

function AuthorizeNFT({ context }: InnerProps) {
  return (
    <div>
      This allows the Pawn Shop to move your NFT and to trasnfer it to the
      lender if you do not repay your loan.
    </div>
  );
}

function PendingAuthorization({ context }: InnerProps) {
  return <div>This can take a few minutes.</div>;
}

function LoanFormUnfocused({ context }: InnerProps) {
  return (
    <div>
      Set your loan terms. Any lender who wishes can meet these terms, and you
      will automatically receive the loan amount minus a 1% origination fee.
    </div>
  );
}

function Denomination({ context }: InnerProps) {
  return (
    <div>
      This is the token used for the loan principal, interest, and repayment.
    </div>
  );
}

function LoanAmount({ context }: InnerProps) {
  return (
    <div>
      Lenders can give you a larger loan, but this is the minimum amount
      you&apos;ll accept.
    </div>
  );
}

function MinimumDuration({ context }: InnerProps) {
  return (
    <div>
      Lenders can give you a longer loan and reset the duration, but this is the
      minimum length of a loan you&apos;ll accept.
    </div>
  );
}

const SECONDS_IN_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;

function MaximumInterestRate({ context }: InnerProps) {
  if (context.interestRate) {
    const interestRatePerSecond = ethers.BigNumber.from(
      Math.floor(context.interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
    ).div(SECONDS_IN_YEAR);
    return (
      <div>
        Because interest is stored and calculated per second instead of
        annually, the loan ticket will show an APR of{' '}
        {formattedAnnualRate(interestRatePerSecond)}%.
        <EstimatedRepayment context={context} />
      </div>
    );
  }
  return (
    <div>
      Lenders can give you a lower interest rate, but this is the maximum
      interest rate you&apos;ll pay.
    </div>
  );
}

function EstimatedRepayment({
  context: { denomination, duration, interestRate, loanAmount },
}: Pick<ExplainerProps, 'context'>) {
  const [decimals, setDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (denomination) {
      const loanAssetContract = jsonRpcERC20Contract(denomination.address);
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [denomination, setDecimals]);

  if (interestRate && loanAmount && duration && denomination && decimals) {
    const interestRatePerSecond = ethers.BigNumber.from(
      Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
    ).div(SECONDS_IN_YEAR);
    const durationSeconds = daysToSecondsBigNum(duration);
    const parsedLoanAmount = ethers.utils.parseUnits(
      loanAmount.toString(),
      decimals,
    );
    const interestOverTerm = interestRatePerSecond
      .mul(durationSeconds)
      .mul(parsedLoanAmount)
      .div(SCALAR);
    const estimatedRepayment = ethers.utils.formatUnits(
      interestOverTerm.add(parsedLoanAmount),
      decimals,
    );
    return (
      <>
        <br />
        The estimated repayment will be {estimatedRepayment}{' '}
        {denomination.symbol} at maturity.
      </>
    );
  }

  return null;
}

function MintBorrowerTicket({ context }: InnerProps) {
  return (
    <div>
      This is the last step of creating a loan. You will be issued an NFT
      representing your rights and obligations as a borrower. This cannot be
      undone without closing the loan and repaying any loan amount you&apos;ve
      received and interest accrued.
    </div>
  );
}

function PendingMintBorrowerAuthorization({ context }: InnerProps) {
  return <div>This can take a few more minutes.</div>;
}

function MintBorrowerTicketSuccess({ context }: InnerProps) {
  return <div>Your loan is created and available for lenders to see!</div>;
}
