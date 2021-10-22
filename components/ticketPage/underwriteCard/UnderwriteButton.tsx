import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { jsonRpcLoanFacilitator, web3LoanFacilitator } from '../../../lib/contracts';
import { LoanInfo } from '../../../lib/LoanInfoType';
import TransactionButton from '../TransactionButton';

interface UnderwriteButtonProps{
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
} : UnderwriteButtonProps) {
  const [disabled, setDisabled] = useState(false);
  const [has10PercentImprovement, setHas10PercentImprovement] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionPending, setTransactionPending] = useState(false);

  const checkHas10PercentImprovement = () => {
    const hasImprovement = loanAmount.gte(get110Percent(loanInfo.loanAmount))
      || duration.gte(get110Percent(loanInfo.durationSeconds))
      || interestRate.lte(get90Percent(loanInfo.perSecondInterestRate));
    setHas10PercentImprovement(hasImprovement);
    return hasImprovement;
  };

  const get110Percent = (value: ethers.BigNumber) => value.add(value.mul(10).div(100));

  const get90Percent = (value: ethers.BigNumber) => value.mul(90).div(100);

  const underwrite = async () => {
    if (disabled || !isFilled()) {
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
  };

  const waitForUnderwrite = async () => {
    const loanFacilitator = jsonRpcLoanFacilitator();

    const filter = loanFacilitator.filters.UnderwriteLoan(
      loanInfo.loanId,
      account,
    );

    loanFacilitator.once(filter, () => {
      setTransactionPending(false);
      loanUpdatedCallback();
    });
  };

  const isDisabled = () => loanAmount.gt(allowance) || (!checkHas10PercentImprovement() && isFilled());

  const isFilled = () => {
    return !loanAmount.eq(0) && !interestRate.eq(0) && !duration.eq(0);
  };

  useEffect(() => {
    setDisabled(isDisabled());
    checkHas10PercentImprovement();
  });

  return (
    <div>
      <TransactionButton
        text="lend"
        onClick={underwrite}
        disabled={disabled}
        txHash={transactionHash}
        isPending={transactionPending}
      />
      {isFilled()
      && loanInfo.lastAccumulatedTimestamp.toString() != '0'
      && !has10PercentImprovement ? (
        <p>
          {' '}
          Replacing exisiting underwriter requires improving at least one loan
          term by at least 10%
          {' '}
        </p>
        ) : (
          ''
        )}
    </div>
  );
}
