import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getNFTInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fieldset } from 'components/Fieldset';
import { Media } from 'components/Media';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { EtherscanTokenLink } from 'components/EtherscanLink';

interface CollateralCardArgs {
  collateralAddress: string;
  collateralTokenId: ethers.BigNumber;
}

export default function CollateralMediaCard({
  collateralAddress,
  collateralTokenId,
}: CollateralCardArgs) {
  const [CollateralNFTInfo, setCollateralNFTInfo] =
    useState<GetNFTInfoResponse | null>(null);
  const [contractName, setContractName] = useState<string | null>(null);

  const load = useCallback(async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);

    const contractName = await contract.name();
    setContractName(contractName);

    const result = await getNFTInfo({
      contract,
      tokenId: collateralTokenId,
    });
    setCollateralNFTInfo(result);
  }, [collateralAddress, collateralTokenId]);

  useEffect(() => {
    load();
  }, [load]);

  const legend = 'collateral';

  if (!contractName || !CollateralNFTInfo) {
    return (
      <Fieldset legend={legend}>
        <div className="collateral-media"></div>
      </Fieldset>
    );
  }

  return (
    <Fieldset legend={legend}>
      <CollateralMediaCardLoaded
        contractName={contractName}
        contractAddress={collateralAddress}
        nftInfo={CollateralNFTInfo}
      />
    </Fieldset>
  );
}

type CollateralMediaCardLoadedProps = {
  contractName: string;
  contractAddress: string;
  nftInfo: GetNFTInfoResponse;
};
function CollateralMediaCardLoaded({
  contractName,
  contractAddress,
  nftInfo,
}: CollateralMediaCardLoadedProps) {
  const assetId = nftInfo.id.toString();
  return (
    <div>
      <div className="collateral-media nfte__media">
        <Media
          media={nftInfo.mediaUrl}
          mediaMimeType={nftInfo.mediaMimeType}
          autoPlay={true}
        />
      </div>
      <div className="collateralDetails">
        <p>{contractName}</p>
        <p id="collateralTitle">{nftInfo.name}</p>
        <p>
          <a
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${contractAddress}/${assetId}`}
            rel="noreferrer">
            View on OpenSea
          </a>
        </p>
        <p>
          <EtherscanTokenLink
            contractAddress={contractAddress}
            assetId={assetId}>
            View on Etherscan
          </EtherscanTokenLink>
        </p>
        <p>
          <b>Contract Address</b>
          {contractAddress.slice(0, 7)} ... {contractAddress.slice(35, -1)}
        </p>
        <p>
          <b>ID</b>
          {assetId}
        </p>
      </div>
    </div>
  );
}
