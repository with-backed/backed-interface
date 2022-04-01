import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { ethers } from 'ethers';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { estimatedRepayment } from 'lib/loans/utils';
import React, { useEffect, useState } from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import type { CreateFormData } from './CreateFormData';

type ExplainerProps = {
  form: UseFormReturn<CreateFormData, object>;
  state: string;
  top: number;
};

type InnerProps = { context: CreateFormData };

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

export function Explainer({ form, state, top }: ExplainerProps) {
  const error = Object.values(form.formState.errors)[0];
  const Inner = explainers[state];

  return (
    <ExplainerWrapper top={top} display={!!error ? 'error' : 'normal'}>
      {!!error && <Error error={error} />}
      {!error && <Inner context={form.watch()} />}
    </ExplainerWrapper>
  );
}

function Error({
  error,
}: {
  error:
    | FieldError
    | {
        address?: FieldError | undefined;
        symbol?: FieldError | undefined;
      };
}) {
  const anyError = error as any;

  return (
    <>
      🚧
      <div role="alert">
        {!!anyError.address && anyError.address.message}
        {!!anyError.symbol && anyError.symbol.message}
        {!!anyError.message && anyError.message}
      </div>
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

function MaximumInterestRate({ context }: InnerProps) {
  if (context.interestRate) {
    return <EstimatedRepayment context={context} />;
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
}: InnerProps) {
  const [decimals, setDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (denomination) {
      const loanAssetContract = jsonRpcERC20Contract(denomination.address);
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [denomination, setDecimals]);

  if (interestRate && loanAmount && duration && denomination && decimals) {
    const parsedLoanAmount = ethers.utils.parseUnits(
      loanAmount.toString(),
      decimals,
    );
    const durationDaysBigNum = ethers.BigNumber.from(parseFloat(duration));
    // multiply by 10, min interest = 0.1% = 1 in the contract
    // 10 = 10 ** INTEREST_RATE_DECIMALS - 2
    const interest = ethers.BigNumber.from(parseFloat(interestRate) * 10);
    const repayment = estimatedRepayment(
      interest,
      durationDaysBigNum,
      parsedLoanAmount,
      decimals,
    );
    return (
      <div>
        <br />
        The estimated repayment at maturity will be{' '}
        <b>
          {repayment} {denomination.symbol}.
        </b>
      </div>
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
