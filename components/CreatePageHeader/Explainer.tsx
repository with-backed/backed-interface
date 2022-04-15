import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { estimatedRepayment } from 'lib/loans/utils';
import React, { useEffect, useState } from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import type { CreateFormData } from './CreateFormData';
import text from '../../text/text.yml';

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
  return <div>{text.en.explainer_bubble.no_wallet}</div>;
}

function SelectNFT({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.select_an_nft}</div>;
}

function AuthorizeNFT({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.authorize_nft}</div>;
}

function PendingAuthorization({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.pending_authorization}</div>;
}

function LoanFormUnfocused({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.loan_form_unfocused}</div>;
}

function Denomination({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.denomination}</div>;
}

function LoanAmount({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.loan_amount}</div>;
}

function MinimumDuration({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.minimum_duration}</div>;
}

function MaximumInterestRate({ context }: InnerProps) {
  if (context.interestRate) {
    return <EstimatedRepayment context={context} />;
  }
  return <div>{text.en.explainer_bubble.maximum_interest_rate}</div>;
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
    const durationDaysBigNum = ethers.BigNumber.from(
      Math.floor(parseFloat(duration)),
    );
    // multiply by 10, min interest = 0.1% = 1 in the contract
    // 10 = 10 ** INTEREST_RATE_DECIMALS - 2
    const interest = ethers.BigNumber.from(parseFloat(interestRate) * 10);
    const repayment = estimatedRepayment(
      interest,
      durationDaysBigNum,
      parsedLoanAmount,
    );
    const humanRepayment = formatUnits(repayment.toString(), decimals);
    return (
      <div>
        {text.en.explainer_bubble.human_repayment}
        <b>
          {humanRepayment} {denomination.symbol}.
        </b>
      </div>
    );
  }

  return null;
}

function MintBorrowerTicket({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.mint_borrower_ticket}</div>;
}

function PendingMintBorrowerAuthorization({ context }: InnerProps) {
  return (
    <div>{text.en.explainer_bubble.pending_mint_borrower_authorizaiton}</div>
  );
}

function MintBorrowerTicketSuccess({ context }: InnerProps) {
  return <div>{text.en.explainer_bubble.mint_borrower_ticket_success}</div>;
}
