import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import LoanAmountInput from './underwriteCard/LoanAmountInput';
import { loanFacilitator, erc20Contract, jsonRpcERC20Contract } from '../../lib/contracts';
import InterestRateInput from './underwriteCard/InterestRateInput';
import DurationInput from './underwriteCard/DurationInput';
import UnderwriteButton from './underwriteCard/UnderwriteButton';
import AllowButton from './underwriteCard/AllowButton';
import { LoanInfo } from '../../lib/LoanInfoType';


interface UnderwriteCardProps{
  account: string
  loanInfo: LoanInfo
  loanUpdatedCallback: () => void
}

export default function UnderwriteCard({
  account,
  loanInfo,
  loanUpdatedCallback,
}: UnderwriteCardProps) {
  const [loanAssetBalance, setLoanAssetBalance] = useState('');
  const [loanAmount, setLoanAmount] = useState(ethers.BigNumber.from(0));
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from('0'));
  const [duration, setDuration] = useState(ethers.BigNumber.from('0'));
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from('0'),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);

  const getAccountLoanAssetBalance = async (loanAsseetContract) => {
    const balance = await loanAsseetContract.balanceOf(account);
    const humanReadableBalance = ethers.utils.formatUnits(
      balance,
      loanInfo.loanAssetDecimals,
    );
    setLoanAssetBalance(humanReadableBalance);
  };

  const setAllowance = async () => {
    const assetContract = jsonRpcERC20Contract(loanInfo.loanAssetContractAddress)
    const allowance = await assetContract.allowance(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
    );
    if (!needsAllowance) {
      setNeedsAllowance(allowanceValue.lt(loanAmount));
    }
    setAllowanceValue(allowance);
  };

  useEffect(() => {
    if (account == null) {
      return;
    }
    setAllowance();
  }, [account]);

  useEffect(() => {
    setNeedsAllowance(allowanceValue.lt(loanAmount));
  }, [loanAmount]);

  const explainer = () => {
    if (loanInfo.lastAccumulatedTimestamp.eq(0)) {
      return 'Meet or beat the proposed loan terms to underwrite. \
            If repaid, you will receive payment for the loan amount + interest for the entire loan duration.\
            If not repaid, you will be able to claim the NFT collateral.';
    }

    return 'This loan has an underwriter, but you can buy them out by matching their terms  \
        and improving at least one term by at least 10%; longer duration, lower interest, or a higher amount. \
        A buyout requires paying the loan amount and the interest accrued on the loan so far to the current underwriter. \
        \
        If repaid, you will receive payment for the loan amount + interest for the entire loan duration.\
        If not repaid, you will be able to claim the NFT collateral.';
  };

  return (
    <fieldset className="standard-fieldset" id="underwrite-card">
      <legend>underwrite</legend>
      <p> {explainer()} </p>
      <p id="collateral-asset-balance">
        {' '}
        You have
        {loanAssetBalance} {loanInfo.loanAssetSymbol}
      </p>
      <LoanAmountInput
        accountBalance={loanAssetBalance}
        minLoanAmount={loanInfo.loanAmount}
        decimals={loanInfo.loanAssetDecimals}
        loanAssetSymbol={loanInfo.loanAssetSymbol}
        setLoanAmount={setLoanAmount}
      />
      <InterestRateInput
        maxPerSecondRate={loanInfo.perSecondInterestRate}
        setInterestRate={setInterestRate}
      />
      <DurationInput
        minDurationSeconds={loanInfo.durationSeconds}
        setDurationSeconds={setDuration}
      />
      {!needsAllowance ? (
        ''
      ) : (
        <AllowButton
          contractAddress={loanInfo.loanAssetContractAddress}
          account={account}
          symbol={loanInfo.loanAssetSymbol}
          callback={() => setAllowance()}
        />
      )}
      <UnderwriteButton
        loanInfo={loanInfo}
        account={account}
        allowance={allowanceValue}
        interestRate={interestRate}
        loanAmount={loanAmount}
        duration={duration}
        loanUpdatedCallback={loanUpdatedCallback}
      />
    </fieldset>
  );
}
