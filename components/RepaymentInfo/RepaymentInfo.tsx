import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { Loan } from 'types/Loan';
import React from 'react';

type RepaymentInfoProps = {
  loan: Loan;
};

export function RepaymentInfo({ loan }: RepaymentInfoProps) {
  const {
    longFormattedPrincipal,
    longFormattedInterestRate,
    longFormattedEstimatedPaybackAtMaturity,
  } = useLoanDetails(loan);
  return (
    <Fieldset legend="💰 Repayment">
      <DescriptionList orientation="horizontal">
        <dt>Principal</dt>
        <dd>{longFormattedPrincipal}</dd>
        <dt>Interest Rate</dt>
        <dd>{longFormattedInterestRate}</dd>
        <dt>Payback at maturity</dt>
        <dd>{longFormattedEstimatedPaybackAtMaturity}</dd>
      </DescriptionList>
    </Fieldset>
  );
}
