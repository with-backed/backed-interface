import { ethers } from 'ethers';
import { useContext, useState } from 'react';
import { LoanInfo } from 'lib/LoanInfoType';
import { web3LoanFacilitator, jsonRpcLoanFacilitator } from 'lib/contracts';
import { Fieldset } from 'components/Fieldset';
import { Button } from 'components/Button';
import { AccountContext } from 'context/account';

interface SeizeCollateralCardProps {
  loanInfo: LoanInfo;
  seizeCollateralSuccessCallback: () => void;
}

export default function SeizeCollateralCard({
  loanInfo,
  seizeCollateralSuccessCallback,
}: SeizeCollateralCardProps) {
  const { account } = useContext(AccountContext);
  const [amountOwed] = useState(
    ethers.utils.formatUnits(
      loanInfo.interestOwed.add(loanInfo.loanAmount).toString(),
      loanInfo.loanAssetDecimals,
    ),
  );

  // TODO: show loading indicator based on this state?
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const repay = async () => {
    setTxHash('');
    setWaitingForTx(false);

    const t = await web3LoanFacilitator().seizeCollateral(
      loanInfo.loanId,
      // If they've gotten this far, they have an account.
      account as string,
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
    const filter = loanFacilitator.filters.SeizeCollateral(loanInfo.loanId);
    loanFacilitator.once(filter, () => {
      seizeCollateralSuccessCallback();
      setWaitingForTx(false);
    });
  };

  const totalOwed = `${amountOwed} ${loanInfo.loanAssetSymbol}`;

  return (
    <Fieldset legend="seize collateral">
      <p>
        The loan duration is complete. The total interest and principal owed is{' '}
        {totalOwed}, and 0 {loanInfo.loanAssetSymbol} has been repaid. You are
        able to seize the collateral NFT, closing the loan, or wait for
        repayment.
      </p>
      <Button onClick={repay}>seize collateral</Button>
    </Fieldset>
  );
}
