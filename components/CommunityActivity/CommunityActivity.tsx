import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { Fieldset } from 'components/Fieldset';
import { CommunityAccount, getReasons } from 'lib/community';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './CommunityActivity.module.css';

type CommunityActivityProps = {
  account: CommunityAccount | null;
};
export function CommunityActivity({ account }: CommunityActivityProps) {
  const [reasons, setReasons] = useState<{
    [key: string]: { reason: string } | undefined;
  }>({});
  const scoreChanges = useMemo(() => {
    if (account) {
      const changes = account.categoryScoreChanges || [];
      return changes.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  }, [account]);

  useEffect(() => {
    if (account) {
      getReasons(account).then(setReasons);
    }
  }, [account]);

  if (!account) {
    // TODO: handle
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Fieldset legend="✨ XP Earned">
        {scoreChanges.length === 0 && (
          <span>No XP earned by this address yet.</span>
        )}
        {scoreChanges.length > 0 && (
          <ol className={styles.list}>
            {scoreChanges.map((event) => {
              const transactionHash = event.id.split('-')[0];
              const xpDelta = event.newScore - event.oldScore;
              const reason =
                reasons[event.ipfsEntryHash]?.reason ||
                'Initial transition script';
              return (
                <li data-testid={`event-${event.id}`} key={event.id}>
                  <span className={styles.category}>
                    {event.category.name} {xpDelta}XP
                  </span>{' '}
                  <span className={styles[event.category.name]} />{' '}
                  {reason + ' ' || ''}
                  <EtherscanTransactionLink transactionHash={transactionHash}>
                    {new Date(event.timestamp * 1000).toLocaleDateString()}
                  </EtherscanTransactionLink>
                </li>
              );
            })}
          </ol>
        )}
      </Fieldset>
    </div>
  );
}
