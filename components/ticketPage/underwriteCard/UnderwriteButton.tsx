import { useCallback, useMemo, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from 'lib/contracts';
import { LoanInfo } from 'lib/LoanInfoType';
import { TransactionButton } from 'components/ticketPage/TransactionButton';

interface UnderwriteButtonProps {
  loanInfo: LoanInfo;
  account: string;
  allowance: ethers.BigNumber;
  interestRate: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  duration: ethers.BigNumber;
  loanUpdatedCallback: () => void;
}

export default function UnderwriteButton({
  loanInfo,
  account,
  allowance,
  interestRate,
  loanAmount,
  duration,
  loanUpdatedCallback,
}: UnderwriteButtonProps) {
  const [has10PercentImprovement, setHas10PercentImprovement] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);

  const get110Percent = useCallback((value: ethers.BigNumber) => value.add(value.mul(10).div(100)), []);

  const get90Percent = useCallback((value: ethers.BigNumber) => value.mul(90).div(100), []);

  const checkHas10PercentImprovement = useCallback(() => {
    const hasImprovement = loanAmount.gte(get110Percent(loanInfo.loanAmount))
      || duration.gte(get110Percent(loanInfo.durationSeconds))
      || interestRate.lte(get90Percent(loanInfo.perSecondInterestRate));
    setHas10PercentImprovement(hasImprovement);
    return hasImprovement;
  }, [duration, get110Percent, get90Percent, interestRate, loanAmount, loanInfo.durationSeconds, loanInfo.loanAmount, loanInfo.perSecondInterestRate]);

  const isFilled = useCallback(() => {
    return !loanAmount.eq(0) && !interestRate.eq(0) && !duration.eq(0);
  }, [duration, interestRate, loanAmount])

  const waitForUnderwrite = useCallback(async () => {
    const loanFacilitator = jsonRpcLoanFacilitator();

    const filter = loanFacilitator.filters.UnderwriteLoan(
      loanInfo.loanId,
      account,
    );

    loanFacilitator.once(filter, () => {
      setTransactionPending(false);
      loanUpdatedCallback();
    });
  }, [account, loanInfo.loanId, loanUpdatedCallback]);

  const isDisabled = useMemo(() => loanAmount.gt(allowance) || (!checkHas10PercentImprovement() && isFilled()), [allowance, checkHas10PercentImprovement, isFilled, loanAmount]);

  const underwrite = useCallback(async () => {
    if (isDisabled || !isFilled()) {
      return;
    }
    const loanFacilitator = web3LoanFacilitator();
    const t = await loanFacilitator.underwriteLoan(
      loanInfo.loanId,
      interestRate,
      loanAmount,
      duration,
      account,
    );
    setTransactionPending(true);
    setTransactionHash(t.hash);
    t.wait()
      .then((receipt) => {
        setTransactionHash(t.hash);
        waitForUnderwrite();
      })
      .catch((err) => {
        setTransactionPending(false);
        console.log(err);
      });
  }, [account, duration, interestRate, isDisabled, isFilled, loanAmount, loanInfo.loanId, waitForUnderwrite]);

  useEffect(() => {
    checkHas10PercentImprovement();
  }, [checkHas10PercentImprovement]);

  return (
    <div>
      <TransactionButton
        text="lend"
        onClick={underwrite}
        disabled={isDisabled}
        txHash={transactionHash}
        isPending={transactionPending}
      />
      {isFilled()
        && loanInfo.lastAccumulatedTimestamp.toString() != '0'
        && !has10PercentImprovement ? (
        <p>
          Replacing exisiting underwriter requires improving at least one loan
          term by at least 10%
        </p>
      ) : (
        null
      )}
    </div>
  );
}
