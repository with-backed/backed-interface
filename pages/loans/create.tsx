import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { CreateTicketForm } from 'components/createPage/CreateTicketForm';
import Explainer from 'components/createPage/Explainer';
import CollateralMediaCard from 'components/ticketPage/CollateralMediaCard';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { PageWrapper } from 'components/layouts/PageWrapper';

const ConnectWallet = dynamic(
  () => import('components/ConnectWallet').then(mod => mod.ConnectWallet),
  { ssr: false }
);

export default function Create({ }) {
  const [account, setAccount] = useState(null);
  const [collateralAddress, setCollateralAddress] = useState('');
  const [collateralTokenID, setCollateralTokenID] = useState(
    ethers.BigNumber.from(0),
  );
  const [isValidCollateral, setIsValidCollateral] = useState(false);

  return (
    <PageWrapper>
      <PawnShopHeader
        account={account}
        setAccount={setAccount}
        message="create a loan"
      />
      <ThreeColumn>
        <Fieldset legend="pawn your NFT">
          {!account ? (
            <ConnectWallet
              account={account}
              addressSetCallback={setAccount}
            />
          ) : (
            <CreateTicketForm
              account={account}
              collateralAddress={collateralAddress}
              setCollateralAddress={setCollateralAddress}
              collateralTokenID={collateralTokenID}
              setCollateralTokenID={setCollateralTokenID}
              setIsValidCollateral={setIsValidCollateral}
            />
          )}
        </Fieldset>
        {!isValidCollateral ? (
          ''
        ) : (
          <CollateralMediaCard
            collateralAddress={collateralAddress}
            collateralTokenId={collateralTokenID}
          />
        )}
        <Fieldset
          legend="explainer"
        >
          <Explainer />
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}
