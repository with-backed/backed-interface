import { captureException } from '@sentry/nextjs';
import { TransactionButton } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { useConfig } from 'hooks/useConfig';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { SupportedNetwork } from 'lib/config';
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
  const { network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const { data: signer } = useSigner({ onError: captureException });

  const seize = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator(
      signer!,
      network as SupportedNetwork,
    );
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
          message: (
            <div>
              Failed to seize collateral on loan #{loan.id.toString()}.{' '}
              <EtherscanTransactionLink transactionHash={t.hash}>
                View transaction
              </EtherscanTransactionLink>
            </div>
          ),
        });
      });
  }, [addMessage, loan.id, loan.lender, network, refresh, signer]);

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
