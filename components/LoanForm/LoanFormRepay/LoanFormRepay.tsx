import { AllowButton, TransactionButton } from 'components/Button';
import { Loan } from 'types/Loan';
import React, { useCallback, useState } from 'react';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { web3LoanFacilitator } from 'lib/contracts';
import { Explainer } from './Explainer';
import { Form } from 'components/Form';
import { useSigner } from 'wagmi';
import { captureException } from '@sentry/nextjs';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';

type LoanFormRepayProps = {
  loan: Loan;
  balance: number;
  needsAllowance: boolean;
  setNeedsAllowance: (value: boolean) => void;
  refresh: () => void;
};
export function LoanFormRepay({
  loan,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormRepayProps) {
  const {
    formattedTotalPayback,
    formattedPrincipal,
    formattedInterestAccrued,
  } = useLoanDetails(loan);
  const { network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const { data: signer } = useSigner();
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const repay = useCallback(async () => {
    const t = await web3LoanFacilitator(
      signer!,
      network as SupportedNetwork,
    ).repayAndCloseLoan(loan.id);
    setWaitingForTx(true);
    setTxHash(t.hash);
    t.wait()
      .then(() => {
        refresh();
        setWaitingForTx(false);
      })
      .catch((err) => {
        setWaitingForTx(false);
        captureException(err);
        addMessage({
          kind: 'error',
          message: (
            <div>
              Failed to repay loan #{loan.id.toString()}.{' '}
              <EtherscanTransactionLink transactionHash={t.hash}>
                View transaction
              </EtherscanTransactionLink>
            </div>
          ),
        });
      });
  }, [addMessage, loan.id, network, refresh, signer]);

  return (
    <>
      <Form onSubmit={(e) => e.preventDefault()}>
        <p>
          The current Payback amount is:
          <br />
          {formattedPrincipal} (principal)
          <br />+ {formattedInterestAccrued} (interest accrued so far)
          <br />= {formattedTotalPayback} Total
          <br />
          “Repay & Claim” will pay this amount, close the loan, and transfer the
          collateral to your wallet.
        </p>
        <AllowButton
          contractAddress={loan.loanAssetContractAddress}
          symbol={loan.loanAssetSymbol}
          callback={() => setNeedsAllowance(false)}
          done={!needsAllowance}
        />
        <TransactionButton
          text="Repay & claim"
          onClick={repay}
          txHash={txHash}
          isPending={waitingForTx}
          disabled={needsAllowance}
        />
      </Form>
      <Explainer top={0} />
    </>
  );
}
