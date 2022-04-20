import { DisclosureButton } from 'components/Button';
import { DescriptionList } from 'components/DescriptionList';
import { ethers } from 'ethers';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { estimatedRepayment } from 'lib/loans/utils';
import React, { useEffect, useState } from 'react';
import { useDisclosureState, DisclosureContent } from 'reakit/Disclosure';

type Denomination = { address: string; symbol: string };
type CreatePageFields = {
  denomination: Denomination;
  duration: string;
  interestRate: string;
  loanAmount: string;
};

type LoanTermsDisclosureProps = {
  onClick: () => void;
  fields: CreatePageFields;
};
export function LoanTermsDisclosure({
  fields,
  onClick,
}: LoanTermsDisclosureProps) {
  const disclosure = useDisclosureState({ visible: false });

  return (
    <React.Fragment>
      <DisclosureButton
        onClick={onClick}
        disabled={!fieldsAreFull(fields)}
        {...disclosure}>
        Review
      </DisclosureButton>
      <DisclosureContent {...disclosure}>
        <CreatePageTerms fields={fields} />
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
      <dt>Payment Once Loan is Met</dt>
      <dd>
        {ethers.utils.formatUnits(
          parsedLoanAmount.sub(originationFee),
          decimals,
        )}{' '}
        {symbol}
      </dd>
      <dt>Est. Repayment at Maturity</dt>
      <dd>{humanRepayment}</dd>
    </DescriptionList>
  );
}

function fieldsAreFull({
  denomination,
  duration,
  interestRate,
  loanAmount,
}: CreatePageFields): boolean {
  return (
    !!denomination &&
    !!denomination.address &&
    !!denomination.symbol &&
    !!duration &&
    !!interestRate &&
    !!loanAmount
  );
}
