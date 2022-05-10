import { ethers } from 'ethers';
import { web3LoanFacilitator } from 'lib/contracts';
import { daysToSecondsBigNum } from 'lib/duration';
import { Loan } from 'types/Loan';
import { useCallback, useState } from 'react';
import { INTEREST_RATE_PERCENT_DECIMALS } from 'lib/constants';
import { useAccount, useSigner } from 'wagmi';
import { captureException } from '@sentry/nextjs';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import Link from 'next/link';
import { useConfig } from 'hooks/useConfig';

// Annoyingly, the form data gets automatically parsed into numbers, so we can't use the LoanFormData type
type Values = { interestRate: number; duration: number; loanAmount: number };

export function useLoanUnderwriter(
  { id, loanAssetDecimals }: Loan,
  refresh: () => void,
) {
  const { network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const [txHash, setTxHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);
  const [{ data }] = useAccount();
  const [{ data: signer }] = useSigner();
  const account = data?.address;

  const underwrite = useCallback(
    async ({ interestRate, duration, loanAmount }: Values) => {
      if (!account) {
        throw new Error('Cannot underwrite a loan without a connected account');
      }
      const loanFacilitator = web3LoanFacilitator(signer!);
      const annualInterestRate = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** (INTEREST_RATE_PERCENT_DECIMALS - 2)),
      );

      const t = await loanFacilitator.lend(
        id,
        annualInterestRate,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        daysToSecondsBigNum(duration),
        account,
      );

      setTransactionPending(true);
      setTxHash(t.hash);
      t.wait()
        .then(() => {
          setTransactionPending(false);
          refresh();
          addMessage({
            kind: 'success',
            message: (
              <p>
                {
                  '💸 You are now the Lender on this loan! Subscribe to activity notifications from your'
                }
                <Link href={`/network/${network}/profile/${account}`}>
                  {' '}
                  profile page
                </Link>
                .
              </p>
            ),
          });
        })
        .catch((err) => {
          captureException(err);
          setTransactionPending(false);
          addMessage({
            kind: 'error',
            message: (
              <div>
                Failed to underwrite loan #{id.toString()}.{' '}
                <EtherscanTransactionLink transactionHash={t.hash}>
                  View transaction
                </EtherscanTransactionLink>
              </div>
            ),
          });
        });
    },
    [account, addMessage, id, signer, loanAssetDecimals, network, refresh],
  );

  return {
    txHash,
    transactionPending,
    underwrite,
  };
}
