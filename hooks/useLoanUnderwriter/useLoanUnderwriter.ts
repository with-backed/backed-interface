import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import { web3LoanFacilitator } from 'lib/contracts';
import { daysToSecondsBigNum } from 'lib/duration';
import { Loan } from 'types/Loan';
import { useCallback, useState } from 'react';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import {
  INTEREST_RATE_PERCENT_DECIMALS,
  SECONDS_IN_A_YEAR,
} from 'lib/constants';

export function useLoanUnderwriter(
  { id, loanAssetDecimals }: Loan,
  refresh: () => void,
) {
  const [txHash, setTxHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);
  const { account } = useWeb3();
  const underwrite = useCallback(
    async ({ interestRate, duration, loanAmount }: LoanFormData) => {
      if (!account) {
        throw new Error('Cannot underwrite a loan without a connected account');
      }
      const loanFacilitator = web3LoanFacilitator();
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(
          parseFloat(interestRate) * 10 ** INTEREST_RATE_PERCENT_DECIMALS,
        ),
      ).div(SECONDS_IN_A_YEAR);

      const t = await loanFacilitator.underwriteLoan(
        id,
        interestRatePerSecond,
        ethers.utils.parseUnits(loanAmount, loanAssetDecimals),
        daysToSecondsBigNum(parseFloat(duration)),
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
