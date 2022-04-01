import { ethers } from 'ethers';
import { web3LoanFacilitator } from 'lib/contracts';
import { daysToSecondsBigNum } from 'lib/duration';
import { Loan } from 'types/Loan';
import { useCallback, useState } from 'react';
import {
  INTEREST_RATE_PERCENT_DECIMALS,
  SECONDS_IN_A_YEAR,
} from 'lib/constants';
import { useAccount, useSigner } from 'wagmi';

// Annoyingly, the form data gets automatically parsed into numbers, so we can't use the LoanFormData type
type Values = { interestRate: number; duration: number; loanAmount: number };

export function useLoanUnderwriter(
  { id, loanAssetDecimals }: Loan,
  refresh: () => void,
) {
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
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_A_YEAR);

      const t = await loanFacilitator.lend(
        id,
        interestRatePerSecond,
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
        })
        .catch((err) => {
          // TODO: bugsnag
          setTransactionPending(false);
          console.error(err);
        });
    },
    [account, id, signer, loanAssetDecimals, refresh],
  );

  return {
    txHash,
    transactionPending,
    underwrite,
  };
}
