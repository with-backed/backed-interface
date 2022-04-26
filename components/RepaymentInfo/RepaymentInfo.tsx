import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { Loan } from 'types/Loan';
import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { EventAttributes, createEvent } from 'ics';
import { captureException } from '@sentry/nextjs';

type RepaymentInfoProps = {
  loan: Loan;
};

export function RepaymentInfo({ loan }: RepaymentInfoProps) {
  const {
    longFormattedPrincipal,
    longFormattedInterestRate,
    longFormattedEstimatedPaybackAtMaturity,
  } = useLoanDetails(loan);

  const maturityDate = useMemo(
    () =>
      loan.endDateTimestamp
        ? dayjs.unix(loan.endDateTimestamp).format('MMMM D, YYYY')
        : '',
    [loan],
  );

  const createICSEvent = useCallback(() => {
    const endDate = dayjs.unix(loan.endDateTimestamp!);
    const start: [number, number, number] = [
      endDate.year(),
      endDate.day(),
      endDate.month(),
    ];

    const event: EventAttributes = {
      start,
      title: `Loan ${loan.id}: ${loan.collateralName} ${loan.collateralTokenId} due`,
      description: 'Loan repayment for backed is due',
      url: `http://www.withbacked.xyz/loans/${loan.id}`,
      duration: {
        days: 1,
      },
    };

    let returnValue: string = '';
    createEvent(event, (error, value) => {
      if (error) {
        captureException(error);
      }

      returnValue = value;
    });

    return returnValue;
  }, [loan]);

  return (
    <Fieldset legend="💰 Repayment">
      <DescriptionList orientation="horizontal">
        <dt>Principal</dt>
        <dd>{longFormattedPrincipal}</dd>
        <dt>Interest Rate</dt>
        <dd>{longFormattedInterestRate}</dd>
        <dt>Payback at maturity</dt>
        <dd>{longFormattedEstimatedPaybackAtMaturity}</dd>
        <dt>Maturity Date</dt>
        <dd>
          {maturityDate}{' '}
          <img
            src={'/cal-icon.svg'}
            onClick={() => window.open(createICSEvent(), '_blank')}
          />
        </dd>
      </DescriptionList>
    </Fieldset>
  );
}
