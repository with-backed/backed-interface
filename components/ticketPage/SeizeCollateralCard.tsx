import { ethers } from 'ethers';
import { useState } from 'react';
import { web3LoanFacilitator } from 'lib/contracts';
import { Fieldset } from 'components/Fieldset';
import { useWeb3 } from 'hooks/useWeb3';
import { Loan } from 'types/Loan';
import { TransactionButton } from 'components/Button';

interface SeizeCollateralCardProps {
  loanInfo: Loan;
  seizeCollateralSuccessCallback: () => void;
}

export default function SeizeCollateralCard({
  loanInfo,
  seizeCollateralSuccessCallback,
}: SeizeCollateralCardProps) {
  const { account, library } = useWeb3();
  const [amountOwed] = useState(
    ethers.utils.formatUnits(
      loanInfo.interestOwed.add(loanInfo.loanAmount).toString(),
      loanInfo.loanAssetDecimals,
    ),
  );

  // TODO: show loading indicator based on this state?
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const seize = async () => {
    setTxHash('');
    setWaitingForTx(false);

    const t = await web3LoanFacilitator(library!).seizeCollateral(
      loanInfo.id,
      // If they've gotten this far, they have an account.
      account as string,
    );
    setTxHash(t.hash);
    t.wait()
      .then(() => {
        seizeCollateralSuccessCallback();
        setWaitingForTx(false);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.log(err);
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
      <TransactionButton
        text="seize collateral"
        onClick={seize}
        txHash={txHash}
        isPending={waitingForTx}
      />
    </Fieldset>
  );
}
