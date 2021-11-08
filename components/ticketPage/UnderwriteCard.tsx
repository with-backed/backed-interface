import { ethers } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import LoanAmountInput from 'components/ticketPage/underwriteCard/LoanAmountInput';
import { jsonRpcERC20Contract } from 'lib/contracts';
import InterestRateInput from 'components/ticketPage/underwriteCard/InterestRateInput';
import DurationInput from 'components/ticketPage/underwriteCard/DurationInput';
import UnderwriteButton from 'components/ticketPage/underwriteCard/UnderwriteButton';
import AllowButton from 'components/ticketPage/underwriteCard/AllowButton';
import { LoanInfo } from 'lib/LoanInfoType';
import { Fieldset } from 'components/Fieldset';
import { FormWrapper } from 'components/layouts/FormWrapper';

interface UnderwriteCardProps {
  account: string
  loanInfo: LoanInfo
  loanUpdatedCallback: () => void
}

export function UnderwriteCard({
  account,
  loanInfo,
  loanUpdatedCallback,
}: UnderwriteCardProps) {
  const [loanAssetBalance, setLoanAssetBalance] = useState('0');
  const [loanAmount, setLoanAmount] = useState(ethers.BigNumber.from(0));
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from(0));
  const [duration, setDuration] = useState(ethers.BigNumber.from(0));
  const [allowanceValue, setAllowanceValue] = useState(
    ethers.BigNumber.from(0),
  );
  const [needsAllowance, setNeedsAllowance] = useState(false);

  const getAccountLoanAssetBalance = useCallback(async () => {
    const loanAssetContract = jsonRpcERC20Contract(loanInfo.loanAssetContractAddress);
    const balance = await loanAssetContract.balanceOf(account);
    const humanReadableBalance = ethers.utils.formatUnits(
      balance,
      loanInfo.loanAssetDecimals,
    );
    setLoanAssetBalance(humanReadableBalance);
  }, [account, loanInfo.loanAssetContractAddress, loanInfo.loanAssetDecimals]);

  const setAllowance = useCallback(async () => {
    const assetContract = jsonRpcERC20Contract(loanInfo.loanAssetContractAddress);
    const allowance = await assetContract.allowance(
      account,
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT,
    );
    if (!needsAllowance) {
      setNeedsAllowance(allowanceValue.lt(loanAmount));
    }
    setAllowanceValue(allowance);
  }, [account, allowanceValue, loanAmount, loanInfo.loanAssetContractAddress, needsAllowance]);

  useEffect(() => {
    if (account == null) {
      return;
    }
    getAccountLoanAssetBalance();
    setAllowance();
  }, [account, getAccountLoanAssetBalance, setAllowance]);

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
      <p>
        {explainer()}
      </p>
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
      </FormWrapper>
    </Fieldset>
  );
}
