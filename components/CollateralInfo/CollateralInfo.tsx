import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { NFTExchangeAddressLink } from 'components/NFTExchangeLink';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import styles from './CollateralInfo.module.css';
import { DisplayEth } from 'components/DisplayCurrency';
import { useConfig } from 'hooks/useConfig';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { UNISWAP_POSTIION_ADDRESS } from 'lib/constants';
import { nonFungiblePositionManager, v3Pool } from 'lib/contracts';
import { SupportedNetwork } from 'lib/config';
import { useV3PositionFromTokenId } from 'hooks/useV3PositionFromTokenId';
import { useUniswapToken } from 'hooks/useUniswapToken';
import { useCachedRates } from 'hooks/useCachedRates/useCachedRates';
import { getPool } from 'lib/uniswap';

type CollateralInfoProps = {
  loan: Loan;
  collateralSaleInfo: CollateralSaleInfo | null;
};

type CollateralInfoPropsAbsent = CollateralInfoProps & {
  collateralSaleInfo: null;
};
type CollateralInfoPropsPresent = CollateralInfoProps & {
  collateralSaleInfo: CollateralSaleInfo;
};

const CollateralSaleInfoAbsent = ({ loan }: CollateralInfoPropsAbsent) => {
  const tokenId = loan.collateralTokenId.toString();
  return (
    <Fieldset legend="🖼️ Collateral">
      <dd>#{tokenId}</dd>
      <dd>
        <NFTExchangeAddressLink
          contractAddress={loan.collateralContractAddress}
          assetId={tokenId}
        />
      </dd>
    </Fieldset>
  );
};

const CollateralSaleInfoPresent = ({
  collateralSaleInfo,
  loan,
}: CollateralInfoPropsPresent) => {
  const tokenId = loan.collateralTokenId.toString();

  return (
    <Fieldset legend="🖼️ Collateral">
      <DescriptionList>
        <dd>#{tokenId}</dd>
        <dd>
          <NFTExchangeAddressLink
            contractAddress={loan.collateralContractAddress}
            assetId={tokenId}
          />
        </dd>

        {!collateralSaleInfo.recentSale && (
          <>
            <dt className={styles.label}>item&apos;s last sale</dt>
            <dd>No recent sale info</dd>
          </>
        )}
        {!!collateralSaleInfo.recentSale && (
          <>
            <dt className={styles.label}>item&apos;s last sale</dt>
            <dd>
              {collateralSaleInfo.recentSale.price}{' '}
              {collateralSaleInfo.recentSale.paymentToken}
            </dd>
          </>
        )}

        <dt className={styles.label}>collection</dt>
        <dd>{loan.collateralName}</dd>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>items</dt>
          <dd>{collateralSaleInfo.collectionStats.items || '--'}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>floor price</dt>
          <dd>
            <div className={styles.stack}>
              <span>
                {collateralSaleInfo.collectionStats.floor?.toFixed(4) || '--'}{' '}
                ETH
              </span>
              <span className={styles.conversion}>
                <DisplayEth
                  currency="usd"
                  nominal={collateralSaleInfo.collectionStats.floor}
                />
              </span>
            </div>
          </dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>owners</dt>
          <dd>{collateralSaleInfo.collectionStats.owners || '--'}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>volume</dt>
          <dd>
            <div className={styles.stack}>
              <span>
                {collateralSaleInfo.collectionStats.volume?.toFixed(2) || '--'}{' '}
                ETH
              </span>
              <span className={styles.conversion}>
                <DisplayEth
                  currency="usd"
                  nominal={collateralSaleInfo.collectionStats.volume}
                />
              </span>
            </div>
          </dd>
        </div>
      </DescriptionList>
    </Fieldset>
  );
};

const UniswapViewPositionLink = ({ tokenId }: { tokenId: string }) => {
  const { network } = useConfig();
  const href = `https://app.uniswap.org/#/pool/${tokenId}?chain=${network}`;
  return (
    <a target="_blank" rel="noreferrer" href={href}>
      View on Uniswap
    </a>
  );
};

const CollateralInfoUniswap = ({ loan }: CollateralInfoPropsAbsent) => {
  const tokenId = loan.collateralTokenId.toString();
  const { getRate } = useCachedRates();
  const { jsonRpcProvider, network } = useConfig();
  const { positionDetails, loading } = useV3PositionFromTokenId(
    loan.collateralTokenId,
  );

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
  } = positionDetails || {};

  const token0 = useUniswapToken(token0Address);
  const token1 = useUniswapToken(token1Address);

  const [price0, price1] = useMemo(() => {
    if (token0 && token1) {
      return [token0.address, token1.address];
    }
    return [undefined, undefined];
  }, [token0, token1]);

  const fiatValueOfLiquidity: CurrencyAmount<Token> | null = useMemo(() => {
    if (token0 && token1 && feeAmount) {
      const contract = v3Pool(
        token0,
        token1,
        feeAmount,
        jsonRpcProvider,
        network as SupportedNetwork,
      );
      const pool = getPool(contract, token0, token1);
    }
    if (!price0 || !price1 || !position) return null;
    const amount0 = price0.quote(position.amount0);
    const amount1 = price1.quote(position.amount1);
    return amount0.add(amount1);
  }, [price0, price1, position]);

  return (
    <Fieldset legend="🖼️ Collateral">
      <DescriptionList>
        <dd>#{tokenId}</dd>
        <dd>
          <UniswapViewPositionLink tokenId={tokenId} />
        </dd>
        <dt>Collection</dt>
        <dd>uniswap v3 positions</dd>
      </DescriptionList>
    </Fieldset>
  );
};

export const CollateralInfo = ({
  loan,
  collateralSaleInfo,
}: CollateralInfoProps) => {
  if (
    loan.collateralContractAddress.toLowerCase() ===
    UNISWAP_POSTIION_ADDRESS.toLowerCase()
  ) {
    return <CollateralInfoUniswap loan={loan} collateralSaleInfo={null} />;
  }

  if (!collateralSaleInfo) {
    return <CollateralSaleInfoAbsent loan={loan} collateralSaleInfo={null} />;
  }

  return (
    <CollateralSaleInfoPresent
      loan={loan}
      collateralSaleInfo={collateralSaleInfo}
    />
  );
};
