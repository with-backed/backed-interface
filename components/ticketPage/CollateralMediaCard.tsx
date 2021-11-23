import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { getNFTInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Fieldset } from 'components/Fieldset';
import { Media } from 'components/Media';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { EtherscanTokenLink } from 'components/EtherscanLink';
import { useTokenMetadata } from 'hooks/useTokenMetadata';

interface CollateralCardArgs {
  collateralAddress: string;
  collateralTokenId: ethers.BigNumber;
}

export default function CollateralMediaCard({
  collateralAddress,
  collateralTokenId,
}: CollateralCardArgs) {
  const contract = useMemo(() => {
    return jsonRpcERC721Contract(collateralAddress);
  }, [collateralAddress]);

  const [contractName, setContractName] = useState('');
  useEffect(() => {
    contract.name().then((name) => setContractName(name));
  }, [contract, setContractName]);

  const tokenSpec = useMemo(
    () => ({
      contract,
      tokenId: collateralTokenId,
    }),
    [contract, collateralTokenId],
  );
  const tokenMetadata = useTokenMetadata(tokenSpec);

  const legend = 'collateral';

  if (tokenMetadata.isLoading) {
    return <Fieldset legend={legend}></Fieldset>;
  }

  if (tokenMetadata.metadata === null) {
    return <Fieldset legend={legend}></Fieldset>;
  }

  return (
    <Fieldset legend={legend}>
      <CollateralMediaCardLoaded
        contractName={contractName}
        contractAddress={collateralAddress}
        nftInfo={tokenMetadata.metadata}
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
