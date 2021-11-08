import React, { useCallback } from 'react';

interface TransactionButtonProps {
  text: string,
  onClick: () => void,
  txHash: string,
  isPending: boolean,
  disabled?: boolean,
  textSize?: string
}

export function TransactionButton({
  text,
  onClick,
  txHash,
  isPending,
  disabled = false,
  textSize = 'large',
}: TransactionButtonProps) {
  const handleClick = useCallback(() => {
    if (txHash != '' || disabled) {
      return;
    }
    onClick();
  }, [disabled, txHash, onClick]);

  return (
    <div
      className={`${txHash == ''
        ? `button-1 ${disabled ? 'disabled-button' : ''}`
        : 'clicked-button'
        }${textSize != 'large' ? ' small-text' : ''}`}
      onClick={handleClick}
    >
      <p className="inter">
        {' '}
        {text}
        {' '}
      </p>
      {txHash == '' ? (
        ''
      ) : (
        <p className="times">
          {' '}
          {isPending ? 'Pending...' : 'Success!'}
          {' '}
          <a
            href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            view transaction
            {' '}
          </a>
          {' '}
        </p>
      )}
    </div>
  );
}
