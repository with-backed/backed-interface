import { ethers } from 'ethers';
import { useState } from 'react';
import { LoanInfo } from '../../lib/LoanInfoType';
import { web3LoanFacilitator, jsonRpcLoanFacilitator } from '../../lib/contracts';

interface SeizeCollateralCardProps {
  account: string;
  loanInfo: LoanInfo;
  seizeCollateralSuccessCallback: () => void;
}

export default function SeizeCollateralCard({
  account,
  loanInfo,
  seizeCollateralSuccessCallback,
}: SeizeCollateralCardProps) {
  const [amountOwed] = useState(
    ethers.utils.formatUnits(
      loanInfo.interestOwed.add(loanInfo.loanAmount).toString(),
      loanInfo.loanAssetDecimals,
    ),
  );
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const repay = async () => {
    setTxHash('');
    setWaitingForTx(false);

    const t = await web3LoanFacilitator().seizeCollateral(
      loanInfo.loanId,
      account,
    );
    t.wait()
      .then((receipt) => {
        setTxHash(t.hash);
        setWaitingForTx(true);
        wait();
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.log(err);
      });
  };

  const wait = async () => {
    const loanFacilitator = jsonRpcLoanFacilitator();
    const filter = loanFacilitator.filters.SeizeCollateral(
      loanInfo.loanId,
    );
    loanFacilitator.once(filter, () => {
      seizeCollateralSuccessCallback();
      setWaitingForTx(false);
    });
  };

  return (
    <fieldset className="standard-fieldset">
      <legend>seize collateral</legend>
      <p>
        The loan duration is complete. The total interest and principal owed is
        {' '}
        {amountOwed}
        {' '}
        {loanInfo.loanAssetSymbol}
        , and 0
        {' '}
        {loanInfo.loanAssetSymbol}
        {' '}
        has been repaid. You are able to seize the
        collateral NFT, closing the loan, or wait for repayment.
      </p>
      <div className="button-1" onClick={repay}>
        {' '}
        seize collateral
        {' '}
      </div>
    </fieldset>
  );
}
