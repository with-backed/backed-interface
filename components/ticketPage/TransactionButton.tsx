interface TransactionButtonProps{
  text: string,
  onClick: () => void,
  txHash: string,
  isPending: boolean,
  disabled?: boolean,
  textSize?: string
}

export default function TransactionButton({
  text,
  onClick,
  txHash,
  isPending,
  disabled = false,
  textSize = 'large',
}: TransactionButtonProps) {
  const handleClick = () => {
    if (txHash != '' || disabled) {
      return;
    }
    onClick();
  };

  return (
    <div
      className={`${
        txHash == ''
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
            href={`${process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT}/tx/${txHash}`}
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
