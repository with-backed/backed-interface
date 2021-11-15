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

export default function Create({}) {
  const { account } = useContext(AccountContext);
  const [collateralAddress, setCollateralAddress] = useState('');
  const [collateralTokenID, setCollateralTokenID] = useState(
    ethers.BigNumber.from(0),
  );
  const [isValidCollateral, setIsValidCollateral] = useState(false);

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
        <Fieldset legend="explainer">
          <Explainer />
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}
