import { ethers } from 'ethers';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fieldset } from 'components/Fieldset';
import styles from './NFTCollateralPicker.module.css';
import { getNFTInfoFromTokenInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import addressHSl from 'lib/addressHSL';

export interface NFTEntity {
  id: string;
  identifier: ethers.BigNumber;
  uri: string;
  registry: {
    symbol: string;
    name: string;
  };
}

interface NFTCollateralPickerProps {
  nfts: NFTEntity[];
  hiddenNFTAddresses?: string[];
}

interface GroupedNFTCollections {
  [key: string]: NFTEntity[];
}

interface ShowNFTStateType {
  [key: string]: boolean;
}

export function NFTCollateralPicker({
  nfts,
  hiddenNFTAddresses = [],
}: NFTCollateralPickerProps) {
  const [showNFT, setShowNFT] = useState<ShowNFTStateType>({});

  const groupedNFTs: GroupedNFTCollections = useMemo(() => {
    return nfts.reduce(
      (groupedNFTs: GroupedNFTCollections, nextNFT: NFTEntity) => {
        const nftContractAddress: string = nextNFT.id.substring(0, 42);

        if (hiddenNFTAddresses.includes(nftContractAddress)) return groupedNFTs; // skip if hidden collection
        if (!!groupedNFTs[nftContractAddress]) {
          groupedNFTs[nftContractAddress] = [
            ...groupedNFTs[nftContractAddress],
            nextNFT,
          ];
        } else {
          groupedNFTs[nftContractAddress] = [nextNFT];
        }
        return groupedNFTs;
      },
      {},
    );
  }, [nfts, hiddenNFTAddresses]);

  const toggleShowForNFT = useCallback(
    (nftAddress) => {
      setShowNFT((prev) => ({
        ...prev,
        [nftAddress]: !showNFT[nftAddress],
      }));
    },
    [showNFT, setShowNFT],
  );

  return (
    <div className={styles.nftPicker}>
      <div className={styles.selectButton}>select an NFT</div>
      {Object.keys(groupedNFTs).map((nftContractAddress, i) => (
        <div key={nftContractAddress}>
          <div
            className={`${styles.centerAlignedRow} ${styles.nftCollectionRow}`}>
            <div
              className={`${styles.centerAlignedRow} ${styles.nftCollectionNameAndIcon}`}>
              <div
                className={styles.collectionIcon}
                style={{
                  background: addressHSl(nftContractAddress),
                }}
              />
              <div className={styles.collectionName}>
                {groupedNFTs[
                  nftContractAddress
                ][0]?.registry.name.toLowerCase()}
              </div>
            </div>
            <div className={styles.centerAlignedRow}>
              <span className={styles.number}>
                {groupedNFTs[nftContractAddress].length}
              </span>
              <div
                className={`${styles.caret} ${
                  showNFT[nftContractAddress] ? styles.caretOpen : ''
                }`}
                onClick={() => toggleShowForNFT(nftContractAddress)}>
                <Caret />
              </div>
            </div>
          </div>
          {
            <div
              className={`${styles.nftGridWrapper} ${
                showNFT[nftContractAddress]
                  ? styles.gridOpen
                  : styles.gridClosed
              } `}>
              {groupedNFTs[nftContractAddress].map((nft) => (
                <div
                  key={nft.id}
                  className={`${styles.nftGridItem} ${
                    showNFT[nftContractAddress]
                      ? styles.itemOpened
                      : styles.itemClosed
                  }`}>
                  <NFTMedia tokenId={nft.identifier} tokenUri={nft.uri} />
                </div>
              ))}
            </div>
          }
          <hr className={styles.break} />
        </div>
      ))}
    </div>
  );
}

interface NFTMediaProps {
  tokenId: ethers.BigNumber;
  tokenUri: string;
}

function NFTMedia({ tokenId, tokenUri }: NFTMediaProps) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse | null>(null);

  const load = useCallback(async () => {
    const result = await getNFTInfoFromTokenInfo(tokenId, tokenUri, true);
    setNFTInfo(result);
  }, [tokenId, tokenUri]);

  useEffect(() => {
    load();
  }, [load]);

  if (!nftInfo) {
    return null;
  }

  return (
    <Media
      media={nftInfo.mediaUrl}
      mediaMimeType={nftInfo.mediaMimeType}
      autoPlay={false}
    />
  );
}

function Caret() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"></path>
    </svg>
  );
}
