import { Button } from 'components/Button';
import React from 'react';
import styles from './LoanGalleryLoadMore.module.css';

type LoanGalleryLoadMoreProps = {
  isLoadingMore?: boolean;
  isReachingEnd?: boolean;
  loadMore: () => void;
};

export function LoanGalleryLoadMore({
  isLoadingMore,
  isReachingEnd,
  loadMore,
}: LoanGalleryLoadMoreProps) {
  if (isLoadingMore) {
    return (
      <div className={styles.container}>
        <Button kind="secondary">Loading...</Button>
      </div>
    );
  }

  if (isReachingEnd) {
    return (
      <div className={styles.container}>
        <Button kind="secondary" disabled>
          That&apos;s all, folks
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Button onClick={loadMore}>Load More</Button>
    </div>
  );
}
