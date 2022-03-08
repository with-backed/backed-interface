import { useCallback, useMemo, useState } from 'react';
import { TransactionButton } from 'components/Button';
import { CompletedButton } from 'components/Button';
import { authorizeCurrency } from 'lib/authorizations/authorizeCurrency';
import { useWeb3 } from 'hooks/useWeb3';

interface AllowButtonProps {
  contractAddress: string;
  symbol: string;
  callback: () => void;
  done?: boolean;
}

export function AllowButton({
  contractAddress,
  symbol,
  callback,
  done,
}: AllowButtonProps) {
  const { library } = useWeb3();
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const allow = useCallback(() => {
    authorizeCurrency({
      callback,
      contractAddress,
      provider: library!,
      setTxHash,
      setWaitingForTx,
    });
  }, [callback, contractAddress, library, setTxHash, setWaitingForTx]);

  const buttonText = useMemo(() => `Authorize ${symbol}`, [symbol]);

  if (done) {
    return (
      <CompletedButton
        buttonText={buttonText}
        message={<span>Permission granted</span>}
        success
      />
    );
  }

  return (
    <TransactionButton
      type={'button'}
      text={buttonText}
      onClick={allow}
      txHash={txHash}
      isPending={waitingForTx}
    />
  );
}
