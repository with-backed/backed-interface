import { useCallback, useMemo, useState } from 'react';
import styles from './NFTCollateralPicker.module.css';
import { getNftContractAddress, NFTEntity, useNFTs } from 'lib/eip721Subraph';
import { NFTMedia } from 'components/Media/NFTMedia';
import { Modal } from 'components/Modal';
import { DialogStateReturn } from 'reakit/Dialog';

interface NFTCollateralPickerProps {
  connectedWallet: string;
  handleSetSelectedNFT: (nft: NFTEntity) => void;
  hiddenNFTAddresses?: string[];
  dialog: DialogStateReturn;
}

interface GroupedNFTCollections {
  [key: string]: NFTEntity[];
}

interface ShowNFTStateType {
  [key: string]: boolean;
}

export function NFTCollateralPicker({
  connectedWallet,
  handleSetSelectedNFT,
  hiddenNFTAddresses = [],
  dialog,
}: NFTCollateralPickerProps) {
  const { fetching, error, nfts } = useNFTs(connectedWallet);

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

  const handleNFTClick = useCallback(
    (nft: NFTEntity) => {
      handleSetSelectedNFT(nft);
      dialog.setVisible(false);
    },
    [handleSetSelectedNFT, dialog.setVisible],
  );

  if (fetching) {
    return (
      <Modal dialog={dialog}>
        <div className={styles.nftPicker}>loading your NFTs...</div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal dialog={dialog}>
        <div className={styles.nftPicker}>
          oops, we could not load your NFTs
        </div>
      </Modal>
    );
  }

  return (
    <Modal dialog={dialog} heading="✨ 🔍 Select an NFT 🖼 ✨">
      <div className={styles.nftPicker}>
        {Object.keys(groupedNFTs).map(
          (nftContractAddress: string, i: number) => (
            <div
              key={nftContractAddress}
              className={styles.collectionRowWrapper}>
              <div
                className={`${styles.centerAlignedRow} ${styles.nftCollectionRow}`}
                onClick={() => toggleShowForNFT(nftContractAddress)}>
                <div
                  className={`${styles.centerAlignedRow} ${styles.nftCollectionNameAndIcon}`}>
                  <div className={styles.collectionName}>
                    {groupedNFTs[
                      nftContractAddress
                    ][0]?.registry.name.toLowerCase()}
                  </div>
                </div>
                <div className={styles.centerAlignedRow}>
                  <span>{groupedNFTs[nftContractAddress].length}</span>
                  <div
                    className={`${styles.caret} ${
                      showNFT[nftContractAddress] ? styles.caretOpen : ''
                    }`}>
                    <Caret />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.nftGridWrapper} ${
                  showNFT[nftContractAddress]
                    ? styles.gridOpen
                    : styles.gridClosed
                } `}>
                {groupedNFTs[nftContractAddress].map((nft: NFTEntity) => (
                  <div
                    key={nft.id}
                    className={`${styles.nftGridItem} ${
                      showNFT[nftContractAddress]
                        ? styles.itemOpened
                        : styles.itemClosed
                    }`}>
                    <div onClick={() => handleNFTClick(nft)}>
                      <NFTMedia
                        collateralAddress={getNftContractAddress(nft)}
                        collateralTokenID={nft.identifier}
                        forceImage
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </Modal>
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
