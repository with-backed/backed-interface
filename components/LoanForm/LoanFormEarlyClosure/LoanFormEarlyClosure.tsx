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

type LoanFormEarlyClosureProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanFormEarlyClosure({
  loan,
  refresh,
}: LoanFormEarlyClosureProps) {
  const { network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const [{ data: signer }] = useSigner();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const close = useCallback(async () => {
    const loanFacilitator = web3LoanFacilitator(
      signer!,
      network as SupportedNetwork,
    );
    const t = await loanFacilitator.closeLoan(loan.id, loan.borrower);
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
              Failed to close loan #{loan.id.toString()}.{' '}
              <EtherscanTransactionLink transactionHash={t.hash}>
                View transaction
              </EtherscanTransactionLink>
            </div>
          ),
        });
      });
  }, [addMessage, loan.id, loan.borrower, network, refresh, signer]);

  return (
    <>
      <TransactionButton
        text="Close this loan"
        txHash={txHash}
        isPending={isPending}
        onClick={close}
      />
    </>
  );
}
