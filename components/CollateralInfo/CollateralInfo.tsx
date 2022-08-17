import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { NFTExchangeAddressLink } from 'components/NFTExchangeLink';
import { Loan } from 'types/Loan';
import React from 'react';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import styles from './CollateralInfo.module.css';
import { DisplayEth } from 'components/DisplayCurrency';
import { useConfig } from 'hooks/useConfig';

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

const UNISWAP_POSTIION_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

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
