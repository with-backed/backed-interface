import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ERC721Artifact from '../../contracts/ERC721.json';
import getNFTInfo, { GetNFTInfoResponse } from '../../lib/getNFTInfo';
import Media from '../Media';

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

interface CollateralCardArgs {
  collateralAddress: string,
  collateralID: ethers.BigNumber
}

export default function CollateralMediaCard({ collateralAddress, collateralID }: CollateralCardArgs) {
  const [CollateralNFTInfo, setCollateralNFTInfo] = React.useState(null);
  const [contractName, setContractName] = useState(null);

  const load = async () => {
    console.log(`id ${collateralID.toString()}`);

    const collateralContract = new ethers.Contract(
      collateralAddress,
      ERC721Artifact.abi,
      _provider,
    );
    const contractName = await collateralContract.name();
    setContractName(contractName);
    const result = await getNFTInfo({ Contract: collateralContract, tokenId: collateralID });
    setCollateralNFTInfo(result);
  };

  React.useEffect(() => {
    load();
  }, [collateralAddress, collateralID]);

  return (
    <fieldset className="collateral_card standard-fieldset">
      <legend>collateral</legend>
      <div>

        {
            CollateralNFTInfo == null
              ? <div className="collateral-media"> </div>
              : <CollateralMediaCardLoaded contractName={contractName} nftInfo={CollateralNFTInfo} />
        }
      </div>
    </fieldset>
  );
}

function CollateralMediaCardLoaded({ contractName, nftInfo }) {
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
        <p id="collateralTitle">
          {' '}
          { nftInfo.name }
        </p>
        <p><a target="_blank" href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${nftInfo.address}/${nftInfo.id.toString()}`} rel="noreferrer"> View on OpenSea</a></p>
        <p><a target="_blank" href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/token/${nftInfo.address}?a=${nftInfo.id.toString()}`} rel="noreferrer"> View on Etherscan</a></p>
        <p>
          <b>Contract Address</b>
          {' '}
          {nftInfo.address.slice(0, 7)}
          {' '}
          ...
          {' '}
          {nftInfo.address.slice(35, -1)}
          {' '}
        </p>
        <p>
          <b>ID</b>
          {' '}
          {nftInfo.id.toString()}
          {' '}
        </p>
      </div>
    </div>
  );
}
