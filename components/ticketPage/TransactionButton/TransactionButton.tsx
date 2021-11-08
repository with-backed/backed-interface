import { Button } from 'components/Button';
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
    return (
      <div className={styles.submitted}>
        <span className="inter">{text}</span>
        <span className="times">
          {isPending ? 'Pending...' : 'Success!'} <TransactionLink txHash={txHash} />
        </span>
      </div>
    );
  }

  return (
    <Button onClick={handleClick} disabled={disabled}>{text}</Button>
  )
}

type TransactionLinkProps = {
  txHash: string;
}
function TransactionLink({ txHash }: TransactionLinkProps) {
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${txHash}`}
      target="_blank"
      rel="noreferrer"
    >
      view transaction
    </a>
  )
}
