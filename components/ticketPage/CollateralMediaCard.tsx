import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getNFTInfo, { GetNFTInfoResponse } from '../../lib/getNFTInfo';
import Media from '../Media';
import { jsonRpcERC721Contract } from '../../lib/contracts';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

interface CollateralCardArgs {
  collateralAddress: string;
  collateralTokenId: ethers.BigNumber;
}

export default function CollateralMediaCard({
  collateralAddress,
  collateralTokenId,
}: CollateralCardArgs) {
  const [CollateralNFTInfo, setCollateralNFTInfo] = React.useState(null);
  const [contractName, setContractName] = useState(null);

  const load = async () => {
    const contract = jsonRpcERC721Contract(collateralAddress)

    const contractName = await contract.name();
    setContractName(contractName);

    const result = await getNFTInfo({
      contract: contract,
      tokenId: collateralTokenId,
    });
    setCollateralNFTInfo(result);
  };

  React.useEffect(() => {
    load();
  }, [collateralAddress, collateralTokenId]);

  return (
    <fieldset className="collateral_card standard-fieldset">
      <legend>collateral</legend>
      <div>
        {CollateralNFTInfo == null ? (
          <div className="collateral-media"> </div>
        ) : (
          <CollateralMediaCardLoaded
            contractName={contractName}
            contractAddress={collateralAddress}
            nftInfo={CollateralNFTInfo}
          />
        )}
      </div>
    </fieldset>
  );
}

function CollateralMediaCardLoaded({ contractName, contractAddress, nftInfo }) {
  return (
    <div>
      <div className="collateral-media nfte__media">
        <Media
          media={nftInfo.mediaUrl}
          mediaMimeType={nftInfo.mediaMimeType}
          autoPlay={false}
        />
      </div>
      <div className="collateralDetails">
        <p>{contractName}</p>
        <p id="collateralTitle"> {nftInfo.name}</p>
        <p>
          <a
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${
              contractAddress
            }/${nftInfo.id.toString()}`}
            rel="noreferrer">
            {' '}
            View on OpenSea
          </a>
        </p>
        <p>
          <a
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/token/${
              contractAddress
            }?a=${nftInfo.id.toString()}`}
            rel="noreferrer">
            {' '}
            View on Etherscan
          </a>
        </p>
        <p>
          <b>Contract Address</b> {contractAddress.slice(0, 7)} ...{' '}
          {contractAddress.slice(35, -1)}{' '}
        </p>
        <p>
          <b>ID</b> {nftInfo.id.toString()}{' '}
        </p>
      </div>
    </div>
  );
}
