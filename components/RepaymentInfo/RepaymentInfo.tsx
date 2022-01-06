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
    formattedPrincipal,
    formattedInterestRate,
    formattedEstimatedPaybackAtMaturity,
  } = useLoanDetails(loan);
  return (
    <Fieldset legend="💰 Repayment">
      <DescriptionList orientation="horizontal">
        <dt>Principal</dt>
        <dd>{formattedPrincipal}</dd>
        <dt>Interest Rate</dt>
        <dd>{formattedInterestRate}</dd>
        <dt>Payback at maturity</dt>
        <dd>{formattedEstimatedPaybackAtMaturity}</dd>
      </DescriptionList>
    </Fieldset>
  );
}
