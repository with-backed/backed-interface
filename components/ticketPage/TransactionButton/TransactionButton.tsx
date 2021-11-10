import { Button } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import React, { useCallback } from 'react';
import styles from './TransactionButton.module.css';

interface TransactionButtonProps {
  text: string,
  onClick: () => void,
  txHash: string,
  isPending: boolean,
  disabled?: boolean,
  /** @deprecated Unclear whether this is still required */
  textSize?: 'large' | 'small'
}

export function TransactionButton({
  text,
  onClick,
  txHash,
  isPending,
  disabled = false,
}: TransactionButtonProps) {
  const handleClick = useCallback(() => {
    if (txHash != '' || disabled) {
      return;
    }
    onClick();
  }, [disabled, txHash, onClick]);

  if (txHash.length > 0) {
    const message = isPending ? 'Pending...' : 'Success!';
    const transactionLink = (
      <EtherscanTransactionLink transactionHash={txHash}>
        view transaction
      </EtherscanTransactionLink>
    );
    return (
      <div className={styles.submitted}>
        <span className="inter">{text}</span>
        <span className="times">
          {message} {transactionLink}
        </span>
      </div>
    );
  }

  return (
    <Button onClick={handleClick} disabled={disabled}>{text}</Button>
  )
}
