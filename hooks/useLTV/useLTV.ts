import { ethers } from 'ethers';
import { useCachedRates } from 'hooks/useCachedRates/useCachedRates';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';
import { jsonRpcERC20Contract } from 'lib/contracts';
import { useEffect, useState } from 'react';

type UseLTVParams = {
  assetContractAddress?: string;
  loanAmount?: ethers.BigNumber | string;
  floorPrice?: number | null;
};

export function useLTV({
  assetContractAddress,
  floorPrice,
  loanAmount,
}: UseLTVParams) {
  const { getEthRate, getRate } = useCachedRates();
  const [ltv, setLtv] = useState<string | null>(null);
  const { jsonRpcProvider, network } = useConfig();

  useEffect(() => {
    // Don't want to cache a stale LTV, every time this runs we should zero it first
    setLtv(null);
    if (!assetContractAddress || !loanAmount || !floorPrice) {
      // Not enough info to calculate; e.g. if loan form isn't filled out
      return;
    }

    const assetContract = jsonRpcERC20Contract(
      assetContractAddress,
      jsonRpcProvider,
      network as SupportedNetwork,
    );

    const formatter = Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    });

    const getLtv = async () => {
      const [ethRate, loanDenominationRate, decimals] = await Promise.all([
        getEthRate('usd'),
        getRate(assetContractAddress, 'usd'),
        assetContract.decimals(),
      ]);

      if (!ethRate || !loanDenominationRate || !decimals) {
        return;
      }

      const floatLoanAmount =
        // loanAmount is string when coming from form, requires no transformation.
        // BigNumber from chain does need to be formatted.
        typeof loanAmount === 'string'
          ? parseFloat(loanAmount)
          : parseFloat(ethers.utils.formatUnits(loanAmount, decimals));
      const loanAmountUSD = floatLoanAmount * loanDenominationRate;
      const tokenFloorUSD = floorPrice * ethRate;
      const ltvRatio = formatter.format(loanAmountUSD / tokenFloorUSD);

      setLtv(ltvRatio);
    };

    getLtv();
  }, [
    assetContractAddress,
    floorPrice,
    getEthRate,
    getRate,
    jsonRpcProvider,
    loanAmount,
    network,
  ]);

  return ltv;
}
