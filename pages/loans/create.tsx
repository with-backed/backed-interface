import dynamic from 'next/dynamic';
import React, { useContext, useState } from 'react';
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

export default function Create({}) {
  const { account } = useContext(AccountContext);
  const [collateralAddress, setCollateralAddress] = useState('');
  const [collateralTokenID, setCollateralTokenID] = useState(
    ethers.BigNumber.from(0),
  );
  const [isValidCollateral, setIsValidCollateral] = useState(false);
  const [showNFTPicker, setShowNFTPicker] = useState(false);

  return (
    <PageWrapper>
      <PawnShopHeader message="create a loan" />
      <ThreeColumn>
        <Fieldset legend="pawn your NFT">
          {Boolean(account) ? (
            <CreateTicketForm
              collateralAddress={collateralAddress}
              setCollateralAddress={setCollateralAddress}
              collateralTokenID={collateralTokenID}
              setCollateralTokenID={setCollateralTokenID}
              setIsValidCollateral={setIsValidCollateral}
            />
          ) : (
            <ConnectWallet />
          )}
        </Fieldset>
        {isValidCollateral && (
          <CollateralMediaCard
            collateralAddress={collateralAddress}
            collateralTokenId={collateralTokenID}
          />
        )}
        <Fieldset legend="stake collateral">
          <div>
            This NFT will be locked up as collateral for your loan. If you fail
            to repay the loan, the NFT will be transferred to the lender.
          </div>
          <div
            id="connect-wallet-button"
            onClick={() => setShowNFTPicker(true)}>
            select NFT
          </div>
          {showNFTPicker && (
            <Provider value={eip721Client}>
              <div
                style={{
                  position: 'absolute',
                  width: '600px',
                  height: '600px',
                  top: '200px',
                  left: '360px',
                }}>
                <NFTCollateralPicker
                  connectedWallet={'0x31fd8d16641d06e0eada78b475ae367163704774'}
                  handleSetCollateralAddress={setCollateralAddress}
                  handleSetCollateralTokenId={setCollateralTokenID}
                  hidePicker={() => setShowNFTPicker(false)}
                />
              </div>
            </Provider>
          )}
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}
