import React, { useContext, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { CreateTicketForm } from 'components/createPage/CreateTicketForm';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { AccountContext } from 'context/account';
import { ConnectWallet } from 'components/ConnectWallet';
import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider } from 'urql';
import { eip721Client } from 'lib/urql';
import { AuthorizedNFT } from 'components/createPage/AuthorizedNFT';
import {
  NFTEntity,
  getNftContractAddress,
  HIDDEN_NFT_ADDRESSES,
  isNFTApprovedForCollateral,
} from 'lib/eip721Subraph';
import styles from './create.module.css';
import { useDialogState } from 'reakit/Dialog';
import { DialogDisclosureButton } from 'components/Button';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { headerMessages } from 'pawnshopConstants';

export default function Create() {
  const { account } = useContext(AccountContext);
  const [selectedNFT, setSelectedNFT] = useState<NFTEntity>();
  const [isCollateralApproved, setIsCollateralApproved] = useState(false);
  const dialog = useDialogState();

  const [collateralAddress, collateralTokenID] = useMemo(() => {
    if (!selectedNFT) return ['', ethers.BigNumber.from(-1)];
    return [getNftContractAddress(selectedNFT), selectedNFT?.identifier];
  }, [selectedNFT]);

  return (
    <PageWrapper>
      <PawnShopHeader message={headerMessages.create} />
      <ThreeColumn>
        <Fieldset legend="set loan terms">
          {Boolean(account) ? (
            <div>
              <p className={styles.mintBorrowExplainer}>
                After selecting an NFT and setting the loan terms, mint the
                borrower ticket to lock up your NFT and make your loan available
                to lenders.
              </p>
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
            </div>
          ) : (
            <ConnectWallet />
          )}
        </Fieldset>
        <Fieldset legend="select collateral NFT">
          {collateralAddress === '' && (
            <div className={styles.collateralExplainer}>
              <p>
                This NFT will be locked up as collateral for your loan. If you
                fail to repay the loan, the NFT will be transferred to the
                lender.
              </p>
            </div>
          )}
          {selectedNFT !== undefined && (
            <FormWrapper>
              <AuthorizedNFT
                nft={selectedNFT}
                handleApproved={() => setIsCollateralApproved(true)}
              />
              <DialogDisclosureButton {...dialog}>
                Or select a different NFT
              </DialogDisclosureButton>
            </FormWrapper>
          )}
          <Provider value={eip721Client}>
            <NFTCollateralPicker
              hiddenNFTAddresses={HIDDEN_NFT_ADDRESSES}
              connectedWallet={account || ''}
              handleSetSelectedNFT={setSelectedNFT}
              dialog={dialog}
            />
          </Provider>
          {!collateralAddress && (
            <DialogDisclosureButton {...dialog}>
              Select an NFT
            </DialogDisclosureButton>
          )}
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}
