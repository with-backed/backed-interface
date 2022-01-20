import { useWeb3 } from 'hooks/useWeb3';
import { useMemo } from 'react';
import styles from './borrowerLenderBubble.module.css';

type BubblesProps = {
  address: string;
  borrower: boolean;
};

export function BorrowerLenderBubble({ address, borrower }: BubblesProps) {
  const { account } = useWeb3();
  const isConnectedUser = useMemo(
    () => account && account.toLowerCase() === address.toLowerCase(),
    [account, address],
  );

  return (
    <div
      className={`${styles.bubble} ${
        borrower ? styles.borrowerBubble : styles.lenderBubble
      }`}>
      {isConnectedUser && `You are the ${borrower ? 'borrower' : 'lender'}`}
      {!isConnectedUser && `${borrower ? 'Borrower' : 'Lender'} `}
      <span>{address.substring(0, 7)}</span>
    </div>
  );
}
