import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import LoanAmountInput from './underwriteCard/LoanAmountInput';
import { pawnShopContract, erc20Contract } from '../../lib/contracts';
import InterestRateInput from './underwriteCard/InterestRateInput';
import DurationInput from './underwriteCard/DurationInput';
import UnderwriteButton from './underwriteCard/UnderwriteButton';
import AllowButton from './underwriteCard/AllowButton';

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function UnderwriteCard({ account, ticketInfo, loanUpdatedCallback }) {
  const [pawnShop, setPawnShopContract] = useState(null);
  const [web3PawnShop, setWeb3PawnShopContract] = useState(null);
  const [web3CollateralAssetContract, setWeb3CollateralAssetContract] = useState(null);
  const [collateralAssetContract, setCollateralAssetContract] = useState(null);
  const [loanAssetBalance, setLoanAssetBalance] = useState('');
  const [loanAmount, setLoanAmount] = useState(ethers.BigNumber.from(0));
  const [interestRate, setInterestRate] = useState(ethers.BigNumber.from('0'));
  const [duration, setDuration] = useState(ethers.BigNumber.from('0'));
  const [allowanceValue, setAllowanceValue] = useState(ethers.BigNumber.from('0'));
  const [needsAllowance, setNeedsAllowance] = useState(false);
  // const [curTimestamp, ]

  const getAccountLoanAssetBalance = async (loanAsseetContract) => {
    const balance = await loanAsseetContract.balanceOf(account);
    const humanReadableBalance = ethers.utils.formatUnits(balance, ticketInfo.loanAssetDecimals);
    setLoanAssetBalance(humanReadableBalance);
  };

  const setAllowance = async (assetContract) => {
    const allowance = await assetContract.allowance(account, process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT);
    if (!needsAllowance) {
      setNeedsAllowance(allowanceValue.lt(loanAmount));
    }
    setAllowanceValue(allowance);
  };

  useEffect(() => {
    if (account == null) {
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    setWeb3PawnShopContract(pawnShopContract(signer));
    setPawnShopContract(pawnShopContract(jsonRpcProvider));
    setWeb3CollateralAssetContract(erc20Contract(ticketInfo.loanAsset, signer));

    const jsonRpcLoanAssetContract = erc20Contract(ticketInfo.loanAsset, jsonRpcProvider);
    setCollateralAssetContract(jsonRpcLoanAssetContract);
    getAccountLoanAssetBalance(jsonRpcLoanAssetContract);
    setAllowance(jsonRpcLoanAssetContract);
  }, [account]);

  useEffect(() => {
    setNeedsAllowance(allowanceValue.lt(loanAmount));
  }, [loanAmount]);

  const explainer = () => {
    if (ticketInfo.lastAccumulatedTimestamp == 0) {
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
      <legend>
        underwrite
      </legend>
      <p>
        {' '}
        {explainer()}
        {' '}
      </p>
      <p id="collateral-asset-balance">
        {' '}
        You have
        {loanAssetBalance}
        {' '}
        {ticketInfo.loanAssetSymbol}
      </p>
      <LoanAmountInput accountBalance={loanAssetBalance} minLoanAmount={ticketInfo.loanAmount} decimals={ticketInfo.loanAssetDecimals} loanAssetSymbol={ticketInfo.loanAssetSymbol} setLoanAmount={setLoanAmount} />
      <InterestRateInput maxPerSecondRate={ticketInfo.perSecondInterestRate} setInterestRate={setInterestRate} />
      <DurationInput minDurationSeconds={ticketInfo.durationSeconds} setDurationSeconds={setDuration} />
      { !needsAllowance ? '' : <AllowButton jsonRpcContract={collateralAssetContract} web3Contract={web3CollateralAssetContract} account={account} loanAssetSymbol={ticketInfo.loanAssetSymbol} callback={() => setAllowance(collateralAssetContract)} /> }
      <UnderwriteButton
        pawnShopContract={web3PawnShop}
        jsonRPCContract={pawnShop}
        ticketInfo={ticketInfo}
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
