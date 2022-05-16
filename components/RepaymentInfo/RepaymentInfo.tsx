import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { CalendarOptions, GoogleCalendar } from 'datebook';
import styles from './RepaymentInfo.module.css';
import Link from 'next/link';

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

  const calEventLink = useMemo(() => {
    if (!loan.endDateTimestamp) {
      return '';
    }
    const config: CalendarOptions = {
      title: `Backed: Loan #${loan.id} ${loan.collateralName} due`,
      description: `Loan repayment of ${longFormattedEstimatedPaybackAtMaturity} is due: https://www.withbacked.xyz/loans/${loan.id}. Note that this due date could change if the loan is bought out.`,
      start: new Date(loan.endDateTimestamp! * 1000),
    };

    const googleCalendar = new GoogleCalendar(config);
    const link = googleCalendar.render();
    return link;
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
                <Link href={calEventLink} passHref>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Add the end date of this loan to your Google Calendar"
                    title="Add the end date of this loan to your Google Calendar">
                    <img src={'/cal-icon.svg'} />
                  </a>
                </Link>
              </div>
            </dd>
          </>
        )}
      </DescriptionList>
    </Fieldset>
  );
}
