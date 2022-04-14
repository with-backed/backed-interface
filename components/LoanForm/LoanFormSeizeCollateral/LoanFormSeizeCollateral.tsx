import { captureException } from '@sentry/nextjs';
import { TransactionButton } from 'components/Button';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { web3LoanFacilitator } from 'lib/contracts';
import React, { useCallback, useState } from 'react';
import { Loan } from 'types/Loan';
import { useSigner } from 'wagmi';
import { Explainer } from './Explainer';

type LoanFormSeizeCollateralProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanFormSeizeCollateral({
  loan,
  refresh,
}: LoanFormSeizeCollateralProps) {
  const { addMessage } = useGlobalMessages();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const [{ data: signer }] = useSigner();

  const seize = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator(signer!);
    const t = await loanFacilitator.seizeCollateral(loan.id, loan.lender!);
    setIsPending(true);
    setTxHash(t.hash);

    t.wait()
      .then(() => {
        setIsPending(false);
        refresh();
      })
      .catch((err) => {
        setIsPending(false);
        captureException(err);
        addMessage({
          kind: 'error',
          message: `Failed to seize collateral on loan # ${loan.id.toString()}`,
        });
      });
  }, [addMessage, loan.id, loan.lender, refresh, signer]);

  return (
    <>
      <TransactionButton
        id="seizeNFT"
        text="Seize NFT"
        txHash={txHash}
        isPending={isPending}
        onClick={seize}
      />
      <Explainer top={0} />
    </>
  );
}
