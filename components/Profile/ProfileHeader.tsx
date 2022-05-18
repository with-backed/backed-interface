import { DescriptionList } from 'components/DescriptionList';
import { ethers } from 'ethers';
import {
  getActiveLoanCount,
  getClosedLoanCount,
  getAllInterestAmounts,
  getAllPrincipalAmounts,
} from 'lib/loans/profileHeaderMethods';
import { getInterestOwed } from 'lib/loans/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loan } from 'types/Loan';
import { NextLoanDueCountdown } from './NextLoanDueCountdown';
import styles from './profile.module.css';
import { DisplayCurrency } from 'components/DisplayCurrency';
import { Fieldset } from 'components/Fieldset';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { EtherscanAddressLink } from 'components/EtherscanLink';
import { TextButton } from 'components/Button';
import { NotificationsModal } from 'components/NotificationsModal';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import { useRouter } from 'next/router';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useAccount, useDisconnect } from 'wagmi';
import { useConfig } from 'hooks/useConfig';

type ProfileHeaderProps = {
  address: string;
  loans: Loan[];
};

const nothing = '—';

type LoanStatsProps = {
  loans: Loan[];
  kind: 'borrower' | 'lender';
};
function LoanStats({ loans, kind }: LoanStatsProps) {
  const numActiveLoans = useMemo(() => getActiveLoanCount(loans), [loans]);
  const numClosedLoans = useMemo(() => getClosedLoanCount(loans), [loans]);
  const lentToLoans = useMemo(
    () => loans.filter((l) => !l.lastAccumulatedTimestamp.eq(0)),
    [loans],
  );

  const principalLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Principal' : 'Outstanding Principal',
    [kind],
  );
  const principalAmounts = useMemo(() => {
    const amounts = getAllPrincipalAmounts(lentToLoans);
    if (amounts.length === 0) {
      return nothing;
    }
    return amounts.map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {amount.nominal} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [lentToLoans]);
  const interestLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Interest' : 'Total Accrued Interest',
    [kind],
  );
  const totalLabel = useMemo(
    () => (kind === 'borrower' ? 'Total Owed' : 'Total Outstanding'),
    [kind],
  );

  const [currentInterestAmounts, setCurrentInterestAmounts] = useState(
    getAllInterestAmounts(lentToLoans),
  );

  const refreshInterest = useCallback(() => {
    setCurrentInterestAmounts(
      getAllInterestAmounts(
        lentToLoans.map((l) => ({
          ...l,
          interestOwed: getInterestOwed(
            ethers.BigNumber.from(Date.now()).div(1000),
            l.loanAmount,
            l.lastAccumulatedTimestamp,
            l.perAnumInterestRate,
            l.accumulatedInterest,
          ),
        })),
      ),
    );
  }, [lentToLoans]);

  useEffect(() => {
    const timeOutId = setInterval(() => refreshInterest(), 1000);
    return () => clearInterval(timeOutId);
  }, [refreshInterest]);

  const interestAmounts = useMemo(() => {
    if (currentInterestAmounts.length === 0) {
      return nothing;
    }
    return currentInterestAmounts.map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {parseFloat(amount.nominal).toFixed(6)} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [currentInterestAmounts]);
  const totalAmounts = useMemo(() => {
    return [...currentInterestAmounts, ...getAllPrincipalAmounts(lentToLoans)];
  }, [currentInterestAmounts, lentToLoans]);

  return (
    <DescriptionList orientation="vertical">
      <dt>Loans</dt>
      <dd>
        {numActiveLoans} Active; {numClosedLoans} Closed
      </dd>
      <dt>Next Loan Due</dt>
      <dd>
        <NextLoanDueCountdown loans={lentToLoans} />
      </dd>
      <dt>{principalLabel}</dt>
      <dd>{principalAmounts}</dd>
      <dt>{interestLabel}</dt>
      <dd>{interestAmounts}</dd>
      <dt>{totalLabel}</dt>
      <dd>
        {totalAmounts.length > 0 ? (
          <DisplayCurrency amounts={totalAmounts} currency="usd" />
        ) : (
          nothing
        )}
      </dd>
    </DescriptionList>
  );
}

export function ProfileHeader({ address, loans }: ProfileHeaderProps) {
  const { network } = useConfig();
  const { query } = useRouter();
  const { addMessage, removeMessage } = useGlobalMessages();
  const { data } = useAccount();
  const { disconnect } = useDisconnect();
  const connectedAddress = data?.address;

  useEffect(() => {
    const { unsubscribe, uuid } = query;

    async function unsubscribeEmail() {
      addMessage({
        kind: 'info',
        message: 'unsubscribing...',
      });

      const res = await fetch(
        `/api/network/${network}/addresses/${address}/notifications/emails/${uuid}`,
        {
          method: 'DELETE',
        },
      );

      if (res.status === 200) {
        addMessage({
          kind: 'success',
          message: 'unsubscribe successful',
        });
      } else {
        addMessage({
          kind: 'error',
          message: 'unsubscribe not successful, please try again',
        });
      }
    }

    if (unsubscribe) {
      unsubscribeEmail();
    }
  }, [query, address, addMessage, removeMessage, network]);

  const loansAsBorrower = useMemo(
    () => loans.filter((l) => l.borrower === ethers.utils.getAddress(address)),
    [loans, address],
  );
  const loansAsLender = useMemo(
    () => loans.filter((l) => l.lender === ethers.utils.getAddress(address)),
    [loans, address],
  );

  const dialog = useDialogState();

  return (
    <div className={styles['profile-header-wrapper']}>
      <TwelveColumn>
        <Fieldset legend="📭 Address">
          <div className={styles.container}>
            <span>{address}</span>
            <EtherscanAddressLink address={address}>
              View on Etherscan 🔗
            </EtherscanAddressLink>
            <DialogDisclosure as={'text'} {...dialog}>
              <TextButton kind="clickable">Subscribe to updates 🔔</TextButton>
            </DialogDisclosure>
            {connectedAddress && connectedAddress === address && (
              <TextButton
                kind="clickable"
                onClick={() => {
                  disconnect();
                }}>
                Disconnect 🚪
              </TextButton>
            )}
          </div>
        </Fieldset>
        <Fieldset legend="🖼 Borrowing">
          <div className={styles.container}>
            <LoanStats loans={loansAsBorrower} kind="borrower" />
          </div>
        </Fieldset>
        <Fieldset legend="💸 Lending">
          <div className={styles.container}>
            <LoanStats loans={loansAsLender} kind="lender" />
          </div>
        </Fieldset>
      </TwelveColumn>
      <NotificationsModal profileAddress={address} dialog={dialog} />
    </div>
  );
}
