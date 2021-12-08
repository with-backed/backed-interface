import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import LoanAmountInput from 'components/ticketPage/underwriteCard/LoanAmountInput';
import { jsonRpcERC20Contract } from 'lib/contracts';
import InterestRateInput from 'components/ticketPage/underwriteCard/InterestRateInput';
import DurationInput from 'components/ticketPage/underwriteCard/DurationInput';
import UnderwriteButton from 'components/ticketPage/underwriteCard/UnderwriteButton';
import AllowButton from 'components/ticketPage/underwriteCard/AllowButton';
import { LoanInfo } from 'lib/LoanInfoType';
import { Fieldset } from 'components/Fieldset';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { useWeb3 } from 'hooks/useWeb3';
import { environmentVariables } from 'lib/environmentVariables';

interface UnderwriteCardProps {
  loanInfo: LoanInfo;
  loanUpdatedCallback: () => void;
}

export function UnderwriteCard({
  loanInfo,
  loanUpdatedCallback,
}: UnderwriteCardProps) {
  const { account } = useWeb3();
  const [loanAssetBalance, setLoanAssetBalance] = useState('0');
  const [loanAmount, setLoanAmount] = useState(ethers.BigNumber.from(0));
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from(0));
  const [duration, setDuration] = useState(ethers.BigNumber.from(0));
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from(0),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);

  const getAccountLoanAssetBalance = async () => {
    const loanAssetContract = jsonRpcERC20Contract(
      loanInfo.loanAssetContractAddress,
    );
    const balance = await loanAssetContract.balanceOf(account as string);
    const humanReadableBalance = ethers.utils.formatUnits(
      balance,
      loanInfo.loanAssetDecimals,
    );
    setLoanAssetBalance(humanReadableBalance);
  };

  const setAllowance = async () => {
    const assetContract = jsonRpcERC20Contract(
      loanInfo.loanAssetContractAddress,
    );
    const allowance = await assetContract.allowance(
      account as string,
      environmentVariables.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
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
    getAccountLoanAssetBalance();
    setAllowance();
  }, [account]);

  useEffect(() => {
    setNeedsAllowance(allowanceValue.lt(loanAmount));
  }, [allowanceValue, loanAmount]);

  const explainer = () => {
    if (loanInfo.lastAccumulatedTimestamp.eq(0)) {
      return 'Meet or beat the proposed loan terms to lend. \
            If repaid, you will receive payment for the loan amount + interest for the entire loan duration.\
            If not repaid, you will be able to claim the NFT collateral.';
    }

    return 'This loan has a lender, but you can buy them out by matching their terms  \
        and improving at least one term by at least 10%; longer duration, lower interest, or a higher amount. \
        A buyout requires paying the loan amount and the interest accrued on the loan so far to the current lender. \
        \
        If repaid, you will receive payment for the loan amount + interest for the entire loan duration.\
        If not repaid, you will be able to claim the NFT collateral.';
  };

  return (
    <Fieldset legend="lend">
      <p>{explainer()}</p>
      <p id="collateral-asset-balance">
        {`You have ${loanAssetBalance} ${loanInfo.loanAssetSymbol}`}
      </p>
      <FormWrapper>
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
        {needsAllowance && (
          <AllowButton
            contractAddress={loanInfo.loanAssetContractAddress}
            symbol={loanInfo.loanAssetSymbol}
            callback={() => setAllowance()}
          />
        )}
        <UnderwriteButton
          loanInfo={loanInfo}
          allowance={allowanceValue}
          interestRate={interestRate}
          loanAmount={loanAmount}
          duration={duration}
          loanUpdatedCallback={loanUpdatedCallback}
        />
      </FormWrapper>
    </Fieldset>
  );
}
