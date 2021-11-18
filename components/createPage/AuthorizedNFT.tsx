import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './NFTCollateralPicker.module.css';
import {
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
  web3Erc721Contract,
  web3LoanFacilitator,
} from 'lib/contracts';
import { AllowButton } from './CreateTicketForm/CreateTicketForm';

interface AuthorizedNFTProps {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
}

export function AuthorizedNFT({
  collateralAddress,
  collateralTokenID,
}: AuthorizedNFTProps) {
  return (
    <div className={styles.nftPicker}>
      <AllowButton
        collateralAddress={collateralAddress}
        tokenId={collateralTokenID}
        setIsApproved={() => null}
      />
    </div>
  );
}
