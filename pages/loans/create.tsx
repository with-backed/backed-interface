import dynamic from 'next/dynamic';
import React, { useContext, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { CreateTicketForm } from 'components/createPage/CreateTicketForm';
import Explainer from 'components/createPage/Explainer';
import CollateralMediaCard from 'components/ticketPage/CollateralMediaCard';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { AccountContext } from 'context/account';
import { ConnectWallet } from 'components/ConnectWallet';
import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider } from 'urql';
import { eip721Client } from 'lib/urql';
import { AuthorizedNFT } from 'components/createPage/AuthorizedNFT';
import { Button } from 'components/Button';
import {
  NFTEntity,
  getNftSubraphEntityContractAddress,
  HIDDEN_NFT_ADDRESSES,
  isNFTApprovedForCollateral,
} from 'lib/eip721Subraph';
import styles from './create.module.css';

export default function Create({}) {
  const { account } = useContext(AccountContext);
  const [selectedNFT, setSelectedNFT] = useState<NFTEntity>();
  const [isCollateralApproved, setIsCollateralApproved] = useState(false);
  const [showNFTPicker, setShowNFTPicker] = useState(false);

  const [collateralAddress, collateralTokenID] = useMemo(() => {
    if (!selectedNFT) return ['', ethers.BigNumber.from(-1)];
    return [
      getNftSubraphEntityContractAddress(selectedNFT),
      selectedNFT?.identifier,
    ];
  }, [selectedNFT]);

  return (
    <PageWrapper>
      <PawnShopHeader message="create a loan" />
      <ThreeColumn>
        <Fieldset legend="pawn your NFT">
          {Boolean(account) ? (
            <CreateTicketForm
              collateralAddress={collateralAddress}
              collateralTokenID={collateralTokenID}
              isCollateralApproved={
                !!(
                  isCollateralApproved ||
                  (selectedNFT && isNFTApprovedForCollateral(selectedNFT))
                )
              }
            />
          ) : (
            <ConnectWallet />
          )}
        </Fieldset>
        <Fieldset legend="stake collateral">
          {collateralAddress === '' && (
            <div className={styles.collateralExplainer}>
              <div>
                This NFT will be locked up as collateral for your loan. If you
                fail to repay the loan, the NFT will be transferred to the
                lender.
              </div>
            </div>
          )}
          {selectedNFT !== undefined && (
            <div>
              <AuthorizedNFT
                nft={selectedNFT}
                handleApproved={() => setIsCollateralApproved(true)}
              />
              <div
                onClick={() => setShowNFTPicker(true)}
                className={styles.differentNftText}>
                <div>or select a different NFT</div>
              </div>
            </div>
          )}
          {showNFTPicker && (
            <Provider value={eip721Client}>
              <div className={styles.nftCollateralPickerWrapper}>
                <NFTCollateralPicker
                  hiddenNFTAddresses={HIDDEN_NFT_ADDRESSES}
                  connectedWallet={account || ''}
                  handleSetSelectedNFT={setSelectedNFT}
                  hidePicker={() => setShowNFTPicker(false)}
                />
              </div>
            </Provider>
          )}
          {!showNFTPicker && !collateralAddress && (
            <Button onClick={() => setShowNFTPicker(true)} disabled={false}>
              Select NFT
            </Button>
          )}
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}
