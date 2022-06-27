import { Button } from 'components/Button';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './CommunityHeader.module.css';
import { PlaceholderBunn } from './PlaceholderBunn';
import optimismCircle from './optimism-circle.png';
import { configs } from 'lib/config';
import { useAccount, useNetwork, useSigner } from 'wagmi';
import { jsonRpcCommunityNFT, web3CommunityNFT } from 'lib/contracts';
import { DescriptionList } from 'components/DescriptionList';
import { Select } from 'components/Select';
import { ethers } from 'ethers';

// TODO: optimism for launch
const REQUIRED_NETWORK_ID = configs.rinkeby.chainId;
const JSON_RPC_PROVIDER = configs.rinkeby.jsonRpcProvider;

function CTAContent() {
  return (
    <>
      <h1>You are invited!</h1>
      <p>Join the Backed community with your free-to-mint, soulbound NFT.</p>
      <p>
        Track your activity, earn XP, and update your on-chain art to show off
        your achievements.
      </p>
    </>
  );
}

function CommunityHeaderDisconnected() {
  return (
    <div className={styles.wrapper}>
      <PlaceholderBunn />
      <div className={styles.cta}>
        <CTAContent />
        <Button disabled>Mint for Free</Button>

        <p className={styles['connect-wallet']}>
          Connect your wallet on{' '}
          <Image src={optimismCircle} alt="" height={18} width={18} /> Optimism
          network.
        </p>
      </div>
    </div>
  );
}

function CommunityHeaderMint() {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const mint = useCallback(async () => {
    const contract = web3CommunityNFT(signer!);
    const tx = await contract.mint(account?.address!);
    console.log({ tx });
  }, [account?.address, signer]);
  return (
    <div className={styles.wrapper}>
      <PlaceholderBunn />
      <div className={styles.cta}>
        <CTAContent />
        <div className={styles['button-inline']}>
          <Button onClick={mint}>Mint for Free</Button>
          on Optimism
        </div>
      </div>
    </div>
  );
}

type Accessory = {
  name: string;
  xpBased: boolean;
  artContract: string;
  qualifyingXPScore: ethers.BigNumber;
  xpCategory: ethers.BigNumber;
};

type CommunityTokenMetadata = {
  attributes: { trait_type: string; value: string | number }[];
  description: string;
  image: string;
  name: string;
};

function CommunityHeaderManage() {
  const { data: account } = useAccount();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(null);
  useEffect(() => {
    async function getMetadata() {
      const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
      const tokenID = ethers.BigNumber.from(2);
      const uri = await contract.tokenURI(tokenID);
      const buffer = Buffer.from(uri.split(',')[1], 'base64');
      setMetadata(JSON.parse(buffer.toString()));
    }

    async function getAccessories() {
      const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
      const accessoryIDs = await contract.getUnlockedAccessoriesForAddress(
        account?.address!,
      );
      console.log({ accessoryIDs });
      const accessories = await Promise.all(
        accessoryIDs
          .filter((id) => !id.eq('-0x01'))
          .map((id) => contract.accessoryIdToAccessory(id)),
      );

      setAccessories(accessories);
    }

    getAccessories();
    getMetadata();
  }, [account?.address]);

  console.log({ metadata, accessories });
  return (
    <div className={styles.wrapper}>
      {metadata ? (
        <img
          alt={`Community NFT for ${account?.address}`}
          src={metadata.image as string}
        />
      ) : (
        <PlaceholderBunn />
      )}
      <div className={styles.cta}>
        <h3>🖼🐇 Community NFT</h3>
        <DescriptionList>
          <dt>Address</dt>
          <dd>{account?.address}</dd>
          <dt>Joined</dt>
          <dd>--</dd>
          <dt>Special Trait Displayed</dt>
          <dd>
            <Select
              className={styles.select}
              color="clickable"
              options={[
                {
                  value: '1',
                  label: 'No special trait',
                },
              ]}
            />
          </dd>
        </DescriptionList>
        <Button disabled>Update Art</Button>
      </div>
    </div>
  );
}

type CommunityHeaderConnectedProps = {
  hasNFT: boolean;
};
function CommunityHeaderConnected({ hasNFT }: CommunityHeaderConnectedProps) {
  if (hasNFT) {
    return <CommunityHeaderManage />;
  }

  return <CommunityHeaderMint />;
}

export function CommunityHeader() {
  // TODO: allow update after mint
  const [hasNFT, setHasNFT] = useState(false);
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();

  useEffect(() => {
    const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
    async function checkNFT() {
      if (account?.address) {
        const tokenCount = await contract.balanceOf(account.address);
        if (tokenCount.gt(0)) {
          setHasNFT(true);
        }
      }
    }

    checkNFT();
  }, [account?.address]);

  const onRequiredNetwork = activeChain?.id === REQUIRED_NETWORK_ID;
  console.log({ activeChain, REQUIRED_NETWORK_ID });

  if (onRequiredNetwork) {
    return <CommunityHeaderConnected hasNFT={hasNFT} />;
  }

  return <CommunityHeaderDisconnected />;
}
