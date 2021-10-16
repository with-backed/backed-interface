import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { LoanInfo } from '../../lib/LoanInfoType';
import {
  web3LoanFacilitator,
  jsonRpcLoanFacilitator,
  jsonRpcERC20Contract,
  web3Erc20Contract,
} from '../../lib/contracts';
import AllowButton from './underwriteCard/AllowButton';
import TransactionButton from './TransactionButton';

interface RepayCardProps {
  account: string;
  loanInfo: LoanInfo;
  repaySuccessCallback: () => void;
}

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

export default function RepayCard({
  account,
  loanInfo,
  repaySuccessCallback,
}: RepayCardProps) {
  const [disabled, setDisabled] = useState(false);
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from('0'),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const [amountOwed] = useState(
    loanInfo.interestOwed.add(loanInfo.loanAmount),
  );

  const setAllowance = async () => {
    const contract = jsonRpcERC20Contract(loanInfo.loanAssetContractAddress);
    const allowance = await contract.allowance(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
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

  return (
    <fieldset className="standard-fieldset">
      <legend>repay</legend>
      <p>
        {' '}
        The current cost to repay this loan is
        {ethers.utils.formatUnits(
          amountOwed.toString(),
          loanInfo.loanAssetDecimals,
        )}
        {' '}
        {loanInfo.loanAssetSymbol}
        . On repayment, the NFT collateral will be
        sent to the Pawn Ticket holder,
        {loanInfo.ticketOwner.slice(0, 10)}
        ...
        {loanInfo.ticketOwner.slice(34, 42)}
      </p>
      {!needsAllowance ? (
        ''
      ) : (
        <AllowButton
          contractAddress={loanInfo.loanAssetContractAddress}
          account={account}
          symbol={loanInfo.loanAssetSymbol}
          callback={setAllowance}
        />
      )}
      <RepayButton
        loanId={loanInfo.loanId}
        repaySuccessCallback={repaySuccessCallback}
        disabled={disabled}
      />
    </fieldset>
  );
}

interface RepayButtonProps {
  loanId: ethers.BigNumber
  repaySuccessCallback: () => void
  disabled: boolean
}

function RepayButton({ loanId, repaySuccessCallback, disabled }) {
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const repay = async () => {
    const t = await web3LoanFacilitator().repayAndCloseLoan(
      loanId,
    );
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
    const filter = loanFacilitator.filters.Repay(
      loanId,
    );
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
