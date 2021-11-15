import { ethers } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { LoanInfo } from 'lib/LoanInfoType';
import {
  web3LoanFacilitator,
  jsonRpcLoanFacilitator,
  jsonRpcERC20Contract,
} from 'lib/contracts';
import AllowButton from 'components/ticketPage/underwriteCard/AllowButton';
import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { Fieldset } from 'components/Fieldset';
import { AccountContext } from 'context/account';

interface RepayCardProps {
  loanInfo: LoanInfo;
  repaySuccessCallback: () => void;
}

export function RepayCard({ loanInfo, repaySuccessCallback }: RepayCardProps) {
  const { account } = useContext(AccountContext);
  const [disabled, setDisabled] = useState(false);
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from('0'),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const [amountOwed] = useState(loanInfo.interestOwed.add(loanInfo.loanAmount));

  const setAllowance = async () => {
    const contract = jsonRpcERC20Contract(loanInfo.loanAssetContractAddress);
    const allowance = await contract.allowance(
      // If they've gotten this far, they have an account.
      account as string,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
    );
    if (!needsAllowance) {
      setNeedsAllowance(allowance.lt(amountOwed));
    }
    setDisabled(allowance.lt(amountOwed));
    setAllowanceValue(allowance);
  };

  useEffect(() => {
    setAllowance();
  });

  const { repayAmount, ticketHolder } = useMemo(() => {
    const repayAmount = ethers.utils.formatUnits(
      amountOwed.toString(),
      loanInfo.loanAssetDecimals,
    );
    const ticketHolder =
      loanInfo.ticketOwner.slice(0, 10) +
      '...' +
      loanInfo.ticketOwner.slice(34, 42);
    return { repayAmount, ticketHolder };
  }, [amountOwed, loanInfo]);

  return (
    <Fieldset legend="repay">
      <p>
        The current cost to repay this loan is {repayAmount}. On repayment, the
        NFT collateral will be sent to the Pawn Ticket holder, {ticketHolder}.
      </p>
      {needsAllowance && (
        <AllowButton
          contractAddress={loanInfo.loanAssetContractAddress}
          symbol={loanInfo.loanAssetSymbol}
          callback={setAllowance}
        />
      )}
      <RepayButton
        loanId={loanInfo.loanId}
        repaySuccessCallback={repaySuccessCallback}
        disabled={disabled}
      />
    </Fieldset>
  );
}

interface RepayButtonProps {
  loanId: ethers.BigNumber;
  repaySuccessCallback: () => void;
  disabled: boolean;
}

function RepayButton({
  loanId,
  repaySuccessCallback,
  disabled,
}: RepayButtonProps) {
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const repay = async () => {
    const t = await web3LoanFacilitator().repayAndCloseLoan(loanId);
    setWaitingForTx(true);
    setTxHash(t.hash);
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
    const filter = loanFacilitator.filters.Repay(loanId);
    loanFacilitator.once(filter, () => {
      repaySuccessCallback();
      setWaitingForTx(false);
    });
  };

  return (
    <TransactionButton
      text="repay"
      onClick={repay}
      txHash={txHash}
      isPending={waitingForTx}
      disabled={disabled}
    />
  );
}
