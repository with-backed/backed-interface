import { CommunityAccount } from 'lib/community';
import React, { useMemo } from 'react';
import styles from './CommunityActivity.module.css';

type CommunityActivityProps = {
  account: CommunityAccount | null;
};
export function CommunityActivity({ account }: CommunityActivityProps) {
  const scoreChanges = useMemo(() => {
    if (account) {
      const changes = account.categoryScoreChanges || [];
      return changes.sort((a, b) => a.timestamp - b.timestamp);
    }
    return [];
  }, [account]);

  if (!account) {
    // TODO: handle
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <h2>✨ XP Earned</h2>
      <ol>
        {scoreChanges.map((event) => (
          <li data-testid={`event-${event.id}`} key={event.id}>
            {event.category.name} 1XP{' '}
            {new Date(event.timestamp * 1000).toLocaleDateString()}
          </li>
        ))}
      </ol>
    </div>
  );
}
