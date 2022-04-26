import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { Loan } from 'types/Loan';
import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { CalendarOptions, GoogleCalendar, ICalendar } from 'datebook';
import styles from './RepaymentInfo.module.css';

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

  const createCalEvent = useCallback(() => {
    const config: CalendarOptions = {
      title: `Backed: Loan #${loan.id} ${loan.collateralName} due`,
      description: `Loan repayment of ${longFormattedEstimatedPaybackAtMaturity} is due: https://www.withbacked.xyz/loans/${loan.id}`,
      start: new Date(loan.endDateTimestamp! * 1000),
    };

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      const icalendar = new ICalendar(config);
      icalendar.download();
    } else {
      const googleCalendar = new GoogleCalendar(config);
      const link = googleCalendar.render();
      window.open(link, '_blank');
    }
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
        {!!loan.endDateTimestamp && (
          <>
            <dt>Maturity Date</dt>
            <dd className={styles['maturity-date']}>
              <div>
                {maturityDate}
                <img src={'/cal-icon.svg'} onClick={createCalEvent} />
              </div>
            </dd>
          </>
        )}
      </DescriptionList>
    </Fieldset>
  );
}
