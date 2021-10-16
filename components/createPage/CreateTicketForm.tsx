import { ethers } from 'ethers';
import { useState } from 'react';
import InterestRateInput from './InterestRateInput';
import CollateralAddressInput from './CollateralAddressInput';
import CollateralTokenIDInput from './CollateralTokenIDInput';
import LoanAmountInput from './LoanAmountInput';
import LoanAssetInput from './LoanAssetInput';
import DurationInput from './DurationInput';
import {
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
  web3Erc721Contract,
  web3LoanFacilitator,
} from '../../lib/contracts';
import TransactionButton from '../ticketPage/TransactionButton';
import { NFTLoanFacilitator, NFTLoanFacilitator__factory } from '../../abis/types';

export default function CreateTicketForm({
  account,
  collateralAddress,
  setCollateralAddress,
  collateralTokenID,
  setCollateralTokenID,
  setIsValidCollateral,
}) {
  const [loanAssetContract, setLoanAssetContract] = useState(null);
  const [loanAssetDecimals, setLoanAssetDecimals] = useState(null);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from(0));
  const [duration, setDuration] = useState(ethers.BigNumber.from(0));
  const [isApproved, setIsApproved] = useState(true);
  const [showApproved, setShowApproved] = useState(false);

  const handleApproved = () => {
    setShowApproved(true);
    setIsApproved(true);
  };

  return (
    <div id="create-ticket-form">
      <CollateralAddressInput setCollateralAddress={setCollateralAddress} />
      <CollateralTokenIDInput
        account={account}
        collateralContractAddress={collateralAddress}
        setCollateralTokenID={setCollateralTokenID}
        setIsValidCollateral={setIsValidCollateral}
        setIsApproved={setIsApproved}
      />
      <LoanAssetInput
        setDecimals={setLoanAssetDecimals}
        setLoanAssetAddress={setLoanAssetContract}
      />
      <LoanAmountInput setLoanAmount={setLoanAmount} />
      <InterestRateInput setInterestRate={setInterestRate} />
      <DurationInput setDurationSeconds={setDuration} />
      {isApproved && !showApproved ? (
        ''
      ) : (
        <AllowButton
          account={account}
          setIsApproved={handleApproved}
          collateralAddress={collateralAddress}
          tokenId={collateralTokenID}
        />
      )}
      <MintTicketButton
        account={account}
        isApproved={isApproved}
        collateralAddress={collateralAddress}
        collateralTokenID={collateralTokenID}
        loanAsset={loanAssetContract}
        loanAssetDecimals={loanAssetDecimals}
        loanAmount={loanAmount}
        interestRate={interestRate}
        duration={duration}
      />
    </div>
  );
}

function AllowButton({ account, collateralAddress, tokenId, setIsApproved }) {
  const [transactionHash, setTransactionHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const approve = async () => {
    const web3Contract = web3Erc721Contract(collateralAddress);
    const t = await web3Contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      tokenId,
    );
    setTransactionHash(t.hash);
    setWaitingForTx(true);
    t.wait()
      .then((receipt) => {
        waitForApproval();
        setWaitingForTx(true);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.log(err);
      });
  };

  const waitForApproval = async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);
    const filter = contract.filters.Approval(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      tokenId,
    );
    contract.once(filter, (from, to, tokenID) => {
      setWaitingForTx(false);
      setIsApproved(true);
    });
  };

  return (
    <TransactionButton
      text="allow Pawn Shop to transfer your NFT"
      onClick={approve}
      txHash={transactionHash}
      isPending={waitingForTx}
      textSize="small"
    />
  );
}

function MintTicketButton({
  account,
  isApproved,
  collateralAddress,
  collateralTokenID,
  loanAsset,
  loanAssetDecimals,
  loanAmount,
  interestRate,
  duration,
}) {
  const [transactionHash, setTransactionHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const disabled = () =>
    collateralAddress == '' ||
    collateralTokenID.eq(0) ||
    loanAsset == '' ||
    duration.eq(0);

  const mint = async () => {
    const contract = web3LoanFacilitator();
    const t = await contract.createLoan(
      collateralTokenID,
      collateralAddress,
      interestRate,
      ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
      loanAsset,
      duration,
      account,
    );
    setTransactionHash(t.hash);
    setWaitingForTx(true);
    t.wait()
      .then((receipt) => {
        wait();
        setWaitingForTx(true);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.log(err);
      });
  };

  const wait = async () => {
    const contract = jsonRpcLoanFacilitator();
    const filter = contract.filters.CreateLoan(null, account, null, null, null);
    contract.once(filter, (id, minter, maxInterest, minAount, minDuration) => {
      setWaitingForTx(false);
      window.location.assign(`/tickets/${id.toString()}`);
    });
  };

  return (
    <TransactionButton
      text="Mint Pawn Ticket"
      onClick={mint}
      txHash={transactionHash}
      isPending={waitingForTx}
      disabled={!isApproved}
    />
  );
}
