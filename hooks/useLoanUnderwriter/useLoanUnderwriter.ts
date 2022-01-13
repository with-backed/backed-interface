import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from 'lib/contracts';
import { daysToSecondsBigNum } from 'lib/duration';
import { Loan } from 'types/Loan';
import { useCallback, useState } from 'react';

interface Values {
  amount: number;
  duration: number;
  interestRate: number;
}

const SECONDS_IN_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;

export function useLoanUnderwriter(
  { id, loanAssetDecimals }: Loan,
  refresh: () => void,
) {
  const [txHash, setTxHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);
  const { account } = useWeb3();
  const underwrite = useCallback(
    async ({ interestRate, duration, amount }: Values) => {
      if (!account) {
        throw new Error('Cannot underwrite a loan without a connected account');
      }
      const loanFacilitator = web3LoanFacilitator();
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_YEAR);

      const t = await loanFacilitator.underwriteLoan(
        id,
        interestRatePerSecond,
        ethers.utils.parseUnits(amount.toString(), loanAssetDecimals),
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
          setTransactionPending(false);
          console.error(err);
        });
    },
    [account, id, loanAssetDecimals, refresh],
  );

  return {
    txHash,
    transactionPending,
    underwrite,
  };
}
