import { Button } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import React, { useCallback } from 'react';
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
  id,
  ...props
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
        id={id}
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
    <Button
      id={id}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      {...props}>
      {text}
    </Button>
  );
}
