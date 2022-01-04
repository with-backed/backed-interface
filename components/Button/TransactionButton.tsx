import { Button } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import React, { ButtonHTMLAttributes, useCallback } from 'react';
import { ButtonProps } from './Button';
import { CompletedButton } from './CompletedButton';

interface TransactionButtonProps extends ButtonProps {
  text: string;
  onClick?: () => void;
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
  type,
}: TransactionButtonProps) {
  const handleClick = useCallback(() => {
    if (txHash != '' || disabled || !onClick) {
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
    <Button type={type} onClick={handleClick} disabled={disabled}>
      {text}
    </Button>
  );
}
