import { DisclosureButton } from 'components/Button';
import { DescriptionList } from 'components/DescriptionList';
import { Balance } from 'components/LoanForm/Balance';
import { ethers } from 'ethers';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { estimatedRepayment } from 'lib/loans/utils';
import React, { useEffect, useState } from 'react';
import { useDisclosureState, DisclosureContent } from 'reakit/Disclosure';

type Denomination = { address: string; symbol: string };
type LoanPageFields = {
  denomination: Denomination;
  duration: string;
  interestRate: string;
  loanAmount: string;
};

type LoanTermsDisclosureProps = {
  type: 'CREATE' | 'LEND' | 'BUYOUT';
  onClick: () => void;
  fields: LoanPageFields;
  disclosureButtonDisabled?: boolean;
  balance?: number;
  accrued?: string;
  totalPayback?: string;
};
export function LoanTermsDisclosure({
  type,
  fields,
  disclosureButtonDisabled = false,
  onClick,
  balance,
  accrued,
  totalPayback,
}: LoanTermsDisclosureProps) {
  const disclosure = useDisclosureState({ visible: false });

  return (
    <React.Fragment>
      <DisclosureButton
        id="review"
        onClick={onClick}
        disabled={!fieldsAreFull(fields) || disclosureButtonDisabled}
        {...disclosure}>
        Review
      </DisclosureButton>
      <DisclosureContent {...disclosure}>
        {type === 'CREATE' && <CreatePageTerms fields={fields} />}
        {type === 'LEND' && <LendPageTerms fields={fields} balance={balance} />}
        {type === 'BUYOUT' && (
          <BuyoutPageTerms
            fields={fields}
            balance={balance}
            accrued={accrued}
            totalPayback={totalPayback}
          />
        )}
      </DisclosureContent>
    </React.Fragment>
  );
}

function CreatePageTerms({ fields }: Pick<LoanTermsDisclosureProps, 'fields'>) {
  const [decimals, setDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (fields.denomination) {
      const loanAssetContract = jsonRpcERC20Contract(
        fields.denomination.address,
      );
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [fields.denomination, setDecimals]);

  if (!fieldsAreFull(fields) || !decimals) {
    return null;
  }

  const parsedLoanAmount = ethers.utils.parseUnits(
    parseFloat(fields.loanAmount).toFixed(decimals),
    decimals,
  );
  const originationFee = parsedLoanAmount.div(100);
  const durationDaysBigNum = ethers.BigNumber.from(
    Math.floor(parseFloat(fields.duration)),
  );
  // multiply by 10, min interest = 0.1% = 1 in the contract
  // 10 = 10 ** INTEREST_RATE_DECIMALS - 2
  const interest = ethers.BigNumber.from(
    Math.floor(parseFloat(fields.interestRate) * 10),
  );
  const repayment = estimatedRepayment(
    interest,
    durationDaysBigNum,
    parsedLoanAmount,
  );
  const humanRepayment = ethers.utils.formatUnits(
    repayment.toString(),
    decimals,
  );

  const { symbol } = fields.denomination;

  return (
    <DescriptionList orientation="horizontal">
      <dt>Initial Loan Amount</dt>
      <dd>
        {fields.loanAmount} {symbol}
      </dd>
      <dt>Origination Fee (1%)</dt>
      <dd>
        {ethers.utils.formatUnits(originationFee, decimals)} {symbol}
      </dd>
      <dt>You&apos;ll Receive</dt>
      <dd>
        {ethers.utils.formatUnits(
          parsedLoanAmount.sub(originationFee),
          decimals,
        )}{' '}
        {symbol}
      </dd>
      <dt>Est. Repayment at Maturity</dt>
      <dd>
        {humanRepayment} {symbol}
      </dd>
    </DescriptionList>
  );
}

function LendPageTerms({
  fields,
  balance,
}: Pick<LoanTermsDisclosureProps, 'fields'> &
  Pick<LoanTermsDisclosureProps, 'balance'>) {
  const [decimals, setDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (fields.denomination) {
      const loanAssetContract = jsonRpcERC20Contract(
        fields.denomination.address,
      );
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [fields.denomination, setDecimals]);

  if (!fieldsAreFull(fields) || !decimals) {
    return null;
  }

  const { symbol } = fields.denomination;

  return (
    <DescriptionList orientation="horizontal">
      {balance !== undefined && (
        <Balance
          balance={balance}
          loanAmount={parseFloat(fields.loanAmount)}
          symbol={symbol}
        />
      )}
      <dt>Total Cost</dt>
      <dd>
        {fields.loanAmount} {symbol}
      </dd>
    </DescriptionList>
  );
}

function BuyoutPageTerms({
  fields,
  balance,
  accrued,
  totalPayback,
}: Pick<LoanTermsDisclosureProps, 'fields'> &
  Pick<LoanTermsDisclosureProps, 'balance'> &
  Pick<LoanTermsDisclosureProps, 'accrued'> &
  Pick<LoanTermsDisclosureProps, 'totalPayback'>) {
  const [decimals, setDecimals] = useState<number | null>(null);

  useEffect(() => {
    if (fields.denomination) {
      const loanAssetContract = jsonRpcERC20Contract(
        fields.denomination.address,
      );
      loanAssetContract.decimals().then(setDecimals);
    }
  }, [fields.denomination, setDecimals]);

  if (!fieldsAreFull(fields) || !decimals) {
    return null;
  }

  const { symbol } = fields.denomination;

  return (
    <DescriptionList orientation="horizontal">
      {balance !== undefined && (
        <Balance
          balance={balance}
          loanAmount={parseFloat(fields.loanAmount)}
          symbol={symbol}
        />
      )}
      <dt>Principal</dt>
      <dd>
        {fields.loanAmount} {symbol}
      </dd>
      <dt>Interest Payout To Current Lender</dt>
      <dd>{accrued}</dd>
      <dt>Total Cost</dt>
      <dd>{totalPayback}</dd>
    </DescriptionList>
  );
}

function fieldsAreFull({
  denomination,
  duration,
  interestRate,
  loanAmount,
}: LoanPageFields): boolean {
  return (
    !!denomination &&
    !!denomination.address &&
    !!denomination.symbol &&
    !!duration &&
    !isNaN(parseFloat(duration)) &&
    !!interestRate &&
    !isNaN(parseFloat(interestRate)) &&
    !!loanAmount &&
    !isNaN(parseFloat(loanAmount))
  );
}
