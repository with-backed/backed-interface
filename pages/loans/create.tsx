import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import PawnShopHeader from '../../components/PawnShopHeader';
import CreateTicketForm from '../../components/createPage/CreateTicketForm';
import Explainer from '../../components/createPage/Explainer';
import CollateralMediaCard from '../../components/ticketPage/CollateralMediaCard';

const ConnectWallet = dynamic(() => import('../../components/ConnectWallet'), {
  ssr: false,
});

export default function Create({}) {
  const [account, setAccount] = useState(null);
  const [collateralAddress, setCollateralAddress] = useState('');
  const [collateralTokenID, setCollateralTokenID] = useState(
    ethers.BigNumber.from(0),
  );
  const [isValidCollateral, setIsValidCollateral] = useState(false);

  return (
    <div id="ticket-page-wrapper">
      <PawnShopHeader
        account={account}
        setAccount={setAccount}
        message="create a loan"
      />

      <fieldset className="standard-fieldset float-left">
        <legend> pawn your NFT </legend>
        {account == null ? (
          <ConnectWallet
            account={account}
            addressSetCallback={setAccount}
            buttonType={1}
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
      </fieldset>
      {!isValidCollateral ? (
        ''
      ) : (
        <div className="float-left">
          <CollateralMediaCard
            collateralAddress={collateralAddress}
            collateralTokenId={collateralTokenID}
          />
        </div>
      )}
      <fieldset
        id="create-explainer-fieldset"
        className="standard-fieldset float-left"
      >
        <legend>explainer</legend>
        <Explainer account={account} />
      </fieldset>
    </div>
  );
}
