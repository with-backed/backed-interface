import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TicketInfo } from '../../lib/TicketInfoType';
import {
  web3PawnShopContract,
  pawnShopContract,
  jsonRpcERC20Contract,
  web3Erc20Contract,
} from '../../lib/contracts';
import AllowButton from './underwriteCard/AllowButton';
import TransactionButton from './TransactionButton';

interface RepayCardProps {
  account: string;
  ticketInfo: TicketInfo;
  repaySuccessCallback: () => void;
}

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

export default function RepayCard({
  account,
  ticketInfo,
  repaySuccessCallback,
}: RepayCardProps) {
  const [disabled, setDisabled] = useState(false);
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from('0'),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const [amountOwed] = useState(
    ticketInfo.interestOwed.add(ticketInfo.loanAmount),
  );

  const setAllowance = async () => {
    const contract = jsonRpcERC20Contract(ticketInfo.loanAsset);
    const allowance = await contract.allowance(
      account,
      process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT,
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
          ticketInfo.loanAssetDecimals,
        )}{' '}
        {ticketInfo.loanAssetSymbol}. On repayment, the NFT collateral will be
        sent to the Pawn Ticket holder, {ticketInfo.ticketOwner.slice(0, 10)}
        ...
        {ticketInfo.ticketOwner.slice(34, 42)}
      </p>
      {!needsAllowance ? (
        ''
      ) : (
        <AllowButton
          jsonRpcContract={jsonRpcERC20Contract(ticketInfo.loanAsset)}
          web3Contract={web3Erc20Contract(ticketInfo.loanAsset)}
          account={account}
          loanAssetSymbol={ticketInfo.loanAssetSymbol}
          callback={setAllowance}
        />
      )}
      <RepayButton
        ticketNumber={ticketInfo.ticketNumber}
        repaySuccessCallback={repaySuccessCallback}
        disabled={disabled}
      />
    </fieldset>
  );
}

function RepayButton({ ticketNumber, repaySuccessCallback, disabled }) {
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [web3PawnShop] = useState(web3PawnShopContract);
  const [jsonRpcPawnShop] = useState(pawnShopContract(jsonRpcProvider));

  const repay = async () => {
    const t = await web3PawnShop.repayAndCloseTicket(
      ethers.BigNumber.from(ticketNumber),
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
    const filter = jsonRpcPawnShop.filters.Repay(
      ethers.BigNumber.from(ticketNumber),
      null,
      null,
      null,
      null,
    );
    jsonRpcPawnShop.once(filter, () => {
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
