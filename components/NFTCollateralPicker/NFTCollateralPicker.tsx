import { useCallback, useMemo, useState } from 'react';
import styles from './NFTCollateralPicker.module.css';
import { getNftContractAddress } from 'lib/eip721Subraph';
import { NFTMedia } from 'components/Media/NFTMedia';
import { Modal } from 'components/Modal';
import { DialogStateReturn } from 'reakit/Dialog';
import { Button } from 'reakit/Button';
import { useNFTs } from 'hooks/useNFTs';
import { NFTEntity } from 'types/NFT';

interface NFTCollateralPickerProps {
  connectedWallet: string;
  handleSetSelectedNFT: (nft: NFTEntity) => void;
  hiddenNFTAddresses?: string[];
  dialog: DialogStateReturn;
}

interface GroupedNFTCollections {
  [key: string]: NFTEntity[];
}

export function NFTCollateralPicker({
  connectedWallet,
  handleSetSelectedNFT,
  hiddenNFTAddresses = [],
  dialog,
}: NFTCollateralPickerProps) {
  const { fetching, error, nfts } = useNFTs(connectedWallet);

  const groupedNFTs: GroupedNFTCollections = useMemo(() => {
    return nfts.reduce((groupedNFTs: GroupedNFTCollections, nextNFT) => {
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
    }, {});
  }, [nfts, hiddenNFTAddresses]);

  const handleNFTClick = useCallback(
    (nft: NFTEntity) => {
      handleSetSelectedNFT(nft);
      dialog.setVisible(false);
    },
    [handleSetSelectedNFT, dialog],
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
      <div className={styles.wrapper}>
        {Object.entries(groupedNFTs).map(([contractAddress, nfts]) => {
          return (
            <NFTGroup
              key={contractAddress}
              nftCollectionName={nfts[0]?.registry.name.toLowerCase()}
              nftContractAddress={contractAddress}
              nfts={nfts}
              handleNFTClick={handleNFTClick}
            />
          );
        })}
      </div>
    </Modal>
  );
}

type NFTGroupProps = {
  nftContractAddress: string;
  nftCollectionName: string;
  nfts: NFTEntity[];
  handleNFTClick: (nft: NFTEntity) => void;
};
function NFTGroup({ nftCollectionName, nfts, handleNFTClick }: NFTGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => setIsOpen((prev) => !prev), []);
  return (
    <div className={styles['nft-group']}>
      <Button
        as="div"
        className={styles[`nft-group-header${isOpen ? '-active' : ''}`]}
        onClick={handleClick}>
        <span>{nftCollectionName}</span>
        <span className={styles['nft-count']}>{nfts.length}</span>
      </Button>
      {isOpen && (
        <div className={styles['nft-list']}>
          {nfts.map((nft) => (
            <NFT nft={nft} handleNFTClick={handleNFTClick} key={nft.id} />
          ))}
        </div>
      )}
    </div>
  );
}

type NFTProps = {
  nft: NFTEntity;
  handleNFTClick: (nft: NFTEntity) => void;
};
function NFT({ handleNFTClick, nft }: NFTProps) {
  const handleClick = useCallback(() => {
    handleNFTClick(nft);
  }, [handleNFTClick, nft]);
  return (
    <Button as="div" className={styles.nft} onClick={handleClick}>
      <NFTMedia
        collateralAddress={getNftContractAddress(nft)}
        collateralTokenID={nft.identifier}
        forceImage
      />
    </Button>
  );
}
