import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import InterestRateInput from 'components/createPage/InterestRateInput';
import CollateralAddressInput from 'components/createPage/CollateralAddressInput';
import CollateralTokenIDInput from 'components/createPage/CollateralTokenIDInput';
import LoanAmountInput from 'components/createPage/LoanAmountInput';
import LoanAssetInput from 'components/createPage/LoanAssetInput';
import DurationInput from 'components/createPage/DurationInput';
import {
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
  web3Erc721Contract,
  web3LoanFacilitator,
} from 'lib/contracts';
import TransactionButton from 'components/ticketPage/TransactionButton';
import { FormWrapper } from 'components/layouts/FormWrapper';

export type CreateTicketFormProps = {
  account: string | null;
  collateralAddress: string | null;
  setCollateralAddress: (value: string) => void;
  collateralTokenID?: ethers.BigNumber;
  setCollateralTokenID: (value: ethers.BigNumber) => void;
  setIsValidCollateral: (value: boolean) => void;
}
export function CreateTicketForm({
  account,
  collateralAddress,
  setCollateralAddress,
  collateralTokenID,
  setCollateralTokenID,
  setIsValidCollateral,
}: CreateTicketFormProps) {
  const [loanAssetContract, setLoanAssetContract] = useState(null);
  const [loanAssetDecimals, setLoanAssetDecimals] = useState(null);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from(0));
  const [duration, setDuration] = useState(ethers.BigNumber.from(0));
  const [isApproved, setIsApproved] = useState(true);
  const [showApproved, setShowApproved] = useState(false);

  const handleApproved = useCallback(() => {
    setShowApproved(true);
    setIsApproved(true);
  }, [setShowApproved, setIsApproved]);

  return (
    <FormWrapper>
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
        null
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
    </FormWrapper>
  );
}

type AllowButtonProps = {
  account?: string;
  collateralAddress?: string;
  tokenId?: ethers.BigNumber;
  setIsApproved: (value: boolean) => void;
}
function AllowButton({
  account, collateralAddress, tokenId, setIsApproved,
}: AllowButtonProps) {
  const [transactionHash, setTransactionHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const waitForApproval = useCallback(async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);
    const filter = contract.filters.Approval(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      tokenId,
    );
    contract.once(filter, () => {
      setWaitingForTx(false);
      setIsApproved(true);
    });
  }, [account, collateralAddress, setIsApproved, tokenId]);

  const approve = useCallback(async () => {
    const web3Contract = web3Erc721Contract(collateralAddress);
    const t = await web3Contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
      tokenId,
    );
    setTransactionHash(t.hash);
    setWaitingForTx(true);
    t.wait()
      .then(() => {
        waitForApproval();
        setWaitingForTx(true);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.error(err);
      });
  }, [collateralAddress, tokenId, waitForApproval]);

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

type MintTicketButtonProps = {
  account?: string;
  isApproved?: boolean;
  collateralAddress?: string;
  collateralTokenID?: ethers.BigNumber;
  loanAsset: any;
  loanAssetDecimals: any;
  loanAmount: any;
  interestRate: any;
  duration: any;
};
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
}: MintTicketButtonProps) {
  const [transactionHash, setTransactionHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);

  const disabled = () => collateralAddress == ''
    || collateralTokenID.eq(0)
    || loanAsset == ''
    || duration.eq(0);

  const mint = async () => {
    if (disabled()) {
      return
    }
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
      .then(() => {
        wait();
        setWaitingForTx(true);
      })
      .catch((err) => {
        setWaitingForTx(false);
        console.error(err);
      });
  };

  const wait = async () => {
    const contract = jsonRpcLoanFacilitator();
    const filter = contract.filters.CreateLoan(null, account, null, null, null);
    contract.once(filter, (id) => {
      setWaitingForTx(false);
      window.location.assign(`/loans/${id.toString()}`);
    });
  };

  return (
    <TransactionButton
      text="Create Loan"
      onClick={mint}
      txHash={transactionHash}
      isPending={waitingForTx}
      disabled={!isApproved}
    />
  );
}
