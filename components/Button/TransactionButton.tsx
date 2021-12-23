import { Button } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import React, { useCallback } from 'react';
import { CompletedButton } from './CompletedButton';

interface TransactionButtonProps {
  text: string;
  onClick: () => void;
  txHash: string;
  isPending: boolean;
  disabled?: boolean;
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
      <CompletedButton
        buttonText={text}
        message={
          <span>
            {message} {transactionLink}
          </span>
        }
      />
    );
  }

  return (
    <Button onClick={handleClick} disabled={disabled}>
      {text}
    </Button>
  );
}
