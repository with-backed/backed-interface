import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function UnderwriteButton({
  pawnShopContract, jsonRPCContract, ticketInfo, account, allowance, interestRate, loanAmount, duration, loanUpdatedCallback,
}) {
  const [disabled, setDisabled] = useState(false);
  const [has10PercentImprovement, setHas10PercentImprovement] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const checkHas10PercentImprovement = () => {
    const hasImprovement = loanAmount.gte(get110Percent(ticketInfo.loanAmount))
        || duration.gte(get110Percent(ticketInfo.durationSeconds))
        || interestRate.lte(get90Percent(ticketInfo.perSecondInterestRate));
    setHas10PercentImprovement(hasImprovement);
    return hasImprovement;
  };

  const get110Percent = (value: ethers.BigNumber) => value.add(value.mul(10).div(100));

  const get90Percent = (value: ethers.BigNumber) => value.add(value.mul(90).div(100));

  const underwrite = async () => {
    if (disabled || !isFilled()) {
      return;
    }
    const t = await pawnShopContract.underwritePawnLoan(`${ticketInfo.ticketNumber}`, interestRate, loanAmount, duration, account);
    t.wait().then((receipt) => {
      setTransactionHash(t.hash);
      waitForUnderwrite();
    })
      .catch((err) => {
        console.log(err);
      });
    // loanUpdatedCallback
  };

  const waitForUnderwrite = async () => {
    if (ticketInfo.lastAccumulatedTimestamp.toString() != '0') {
      console.log('in this case');
      const filter = jsonRPCContract.filters.BuyoutUnderwriter(ethers.BigNumber.from(ticketInfo.ticketNumber), account, null);
      jsonRPCContract.once(filter, (id, underwriter, replacedLoanOwner, interestRate, loanAmount, durationSeconds, oldAmount, interestEarned) => {
        console.log('we here');
        loanUpdatedCallback();
      });
    } else {
      console.log(ethers.BigNumber.from(ticketInfo.ticketNumber).toString());
      const filter = jsonRPCContract.filters.UnderwriteLoan(ethers.BigNumber.from(ticketInfo.ticketNumber), account);
      jsonRPCContract.once(filter, () => {
        loanUpdatedCallback();
      });
    }
  };

  const isDisabled = () => loanAmount.gt(allowance) || (!checkHas10PercentImprovement() && isFilled());

  const isFilled = () => {
    const z = ethers.BigNumber.from('0');
    console.log(duration.toString());
    return !loanAmount.eq(z) && !interestRate.eq(z) && !duration.eq(z);
  };

  useEffect(() => {
    setDisabled(isDisabled());
    checkHas10PercentImprovement();
  });

  return (
    <div>
      <div onClick={underwrite} className={`button-1 ${disabled ? 'disabled-button' : ''}`}> underwrite loan </div>
      {isFilled() && ticketInfo.lastAccumulatedTimestamp.toString() != '0' && !has10PercentImprovement
        ? <p> Replacing exisiting underwriter requires improving at least one loan term by at least 10% </p>
        : ''}
    </div>
  );
}
