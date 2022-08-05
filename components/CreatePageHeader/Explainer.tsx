import { Explainer as ExplainerWrapper } from 'components/Explainer';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useCachedRates } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { useLTV } from 'hooks/useLTV';
import { SupportedNetwork } from 'lib/config';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { estimatedRepayment } from 'lib/loans/utils';
import { CollectionStatistics } from 'lib/nftCollectionStats';
import React, { useEffect, useMemo, useState } from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import type { CreateFormData } from './CreateFormData';

type ExplainerProps = {
  form: UseFormReturn<CreateFormData, object>;
  state: string;
  top: number;
  collectionStats: CollectionStatistics | null;
};

type InnerProps = {
  context: CreateFormData & { collectionStats: CollectionStatistics | null };
  decimals: number | null;
};

export const explainers: {
  [key: string]: (props: InnerProps) => JSX.Element;
} = {
  noWallet: NoWallet,
  selectNFT: SelectNFT,
  authorizeNFT: AuthorizeNFT,
  loanFormUnfocused: SetLoanTerms,
  denomination: Denomination,
  loanAmount: LoanAmount,
  minimumDuration: MinimumDuration,
  maximumInterestRate: MaximumInterestRate,
  mintBorrowerTicket: MintBorrowerTicket,
  mintBorrowerTicketSuccess: MintBorrowerTicketSuccess,
  setLoanTerms: SetLoanTerms,
  acceptHigherLoanAmount: LoanAmount,
};

export function Explainer({
  form,
  state,
  top,
  collectionStats,
}: ExplainerProps) {
  const { jsonRpcProvider, network } = useConfig();
  const formData = form.watch();
  const context = { ...formData, collectionStats };
  const [decimals, setDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (context.denomination) {
      const loanAssetContract = jsonRpcERC20Contract(
        context.denomination.address,
        jsonRpcProvider,
        network as SupportedNetwork,
      );
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [context.denomination, jsonRpcProvider, network, setDecimals]);

  const error = Object.values(form.formState.errors)[0];
  const Inner = explainers[state] || null;

  if (!error && !Inner) {
    return null;
  }

  return (
    <ExplainerWrapper top={top} display={!!error ? 'error' : 'normal'}>
      {!!error && <Error error={error} />}
      {!error && <Inner context={context} decimals={decimals} />}
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
      This allows the Pawn Shop to move your NFT and to transfer it to the
      lender if you do not repay your loan.
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
  const ltv = useLTV({
    assetContractAddress: context.denomination.address,
    floorPrice: context.collectionStats?.floor,
    loanAmount: context.loanAmount,
  });

  const ltvInfo = useMemo(() => {
    if (!ltv) {
      return null;
    }

    return (
      <>
        <br />
        Based on the values you have entered, this loan has a Loan-to-Value
        (LTV) ratio of {ltv}.
      </>
    );
  }, [ltv]);

  if (context.acceptHigherLoanAmounts) {
    return (
      <div>
        Lenders can give you a larger loan, but this is the minimum amount
        you&apos;ll accept.
        {ltvInfo}
      </div>
    );
  }

  return (
    <div>
      Lenders will be able to offer improved interest rates and duration, but
      loan amount will stay fixed.
      {ltvInfo}
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

function MaximumInterestRate({ context, decimals }: InnerProps) {
  if (context.interestRate) {
    return <EstimatedRepayment context={context} decimals={decimals} />;
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
  decimals,
}: InnerProps) {
  if (
    interestRate &&
    !isNaN(parseFloat(interestRate)) &&
    loanAmount &&
    !isNaN(parseFloat(loanAmount)) &&
    duration &&
    !isNaN(parseFloat(duration)) &&
    denomination &&
    decimals
  ) {
    const parsedLoanAmount = ethers.utils.parseUnits(
      parseFloat(loanAmount).toFixed(decimals),
      decimals,
    );
    const durationDaysBigNum = ethers.BigNumber.from(
      Math.floor(parseFloat(duration)),
    );
    // multiply by 10, min interest = 0.1% = 1 in the contract
    // 10 = 10 ** INTEREST_RATE_DECIMALS - 2
    const interest = ethers.BigNumber.from(
      Math.floor(parseFloat(interestRate) * 10),
    );
    const repayment = estimatedRepayment(
      interest,
      durationDaysBigNum,
      parsedLoanAmount,
    );
    const humanRepayment = formatUnits(repayment.toString(), decimals);
    return (
      <div>
        The estimated repayment at maturity will be{' '}
        <b>
          {humanRepayment} {denomination.symbol}.
        </b>
      </div>
    );
  }

  return null;
}

function MintBorrowerTicket({ context }: InnerProps) {
  return (
    <div>
      <p style={{ marginTop: 0 }}>
        This NFT will represent your loan offer. This cannot be undone without
        closing the loan and repaying any amount you’ll receive from a lender,
        plus interest.
      </p>
      <p style={{ marginBottom: 0 }}>
        Your repayment can increase as lenders offer higher loan amounts or
        longer durations.
      </p>
    </div>
  );
}

function MintBorrowerTicketSuccess({ context }: InnerProps) {
  return <div>Your loan is created and available for lenders to see!</div>;
}

function SetLoanTerms({ context }: InnerProps) {
  return (
    <div>
      <p style={{ marginTop: 0 }}>
        When a lender meets these terms, you’ll immediately receive the loan
        amount minus a 1% origination fee.
      </p>
      <p style={{ marginBottom: 0 }}>
        Lenders can be &ldquo;bought out&rdquo; by new lenders offering better
        terms (higher amount, lower rate, or longer duration). When this
        happens, the new terms will instantly go into effect.
      </p>
    </div>
  );
}
