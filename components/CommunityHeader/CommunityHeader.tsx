import { Button, TransactionButton } from 'components/Button';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './CommunityHeader.module.css';
import { PlaceholderBunn } from './PlaceholderBunn';
import optimismCircle from './optimism-circle.png';
import { configs } from 'lib/config';
import { useAccount, useNetwork, useSigner } from 'wagmi';
import { jsonRpcCommunityNFT, web3CommunityNFT } from 'lib/contracts';
import { DescriptionList } from 'components/DescriptionList';
import { Select } from 'components/Select';
import { ethers } from 'ethers';
import { captureException } from '@sentry/nextjs';
import { CommunityNFT } from 'types/generated/abis';

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

type CommunityHeaderMintProps = {
  setHasNFT: (value: boolean) => void;
};
function CommunityHeaderMint({ setHasNFT }: CommunityHeaderMintProps) {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const mint = useCallback(async () => {
    const contract = web3CommunityNFT(signer!);
    const tx = await contract.mint(account?.address!);
    setTxHash(tx.hash);
    setIsPending(true);
    tx.wait()
      .then(() => {
        setHasNFT(true);
        setIsPending(false);
      })
      .catch((reason) => captureException(reason));
  }, [account?.address, setHasNFT, signer]);

  return (
    <div className={styles.wrapper}>
      <PlaceholderBunn />
      <div className={styles.cta}>
        <CTAContent />
        <div className={styles['button-inline']}>
          <TransactionButton
            text="Mint for Free"
            onClick={mint}
            txHash={txHash}
            isPending={isPending}
          />
          {!isPending && 'on Optimism'}
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
  id: ethers.BigNumber;
};

type CommunityTokenMetadata = {
  attributes: { trait_type: string; value: string | number }[];
  description: string;
  image: string;
  name: string;
};

async function getTokenID(contract: CommunityNFT, address: string) {
  const nonce = (await contract.nonce()).toNumber();
  for (let i = 0; i < nonce; ++i) {
    const owner = await contract.ownerOf(i);
    if (owner === address) {
      return i;
    }
  }
  return -1;
}

async function getMetadata(address: string): Promise<CommunityTokenMetadata> {
  const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
  const tokenID = await getTokenID(contract, address);
  const uri = await contract.tokenURI(tokenID);
  const buffer = Buffer.from(uri.split(',')[1], 'base64');
  return JSON.parse(buffer.toString());
}

type CommunityPageViewProps = {
  address: string;
};
export function CommunityHeaderView({ address }: CommunityPageViewProps) {
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(null);
  useEffect(() => {
    getMetadata(address).then(setMetadata);
  }, [address]);

  return (
    <div className={styles.wrapper}>
      {metadata ? (
        <img
          alt={`Community NFT for ${address}`}
          src={metadata.image as string}
        />
      ) : (
        <PlaceholderBunn />
      )}
      <div className={styles.cta}>
        <h3>🖼🐇 Community NFT</h3>
        <DescriptionList>
          <dt>Address</dt>
          <dd>{address}</dd>
          <dt>Joined</dt>
          <dd>--</dd>
          <dt>Special Trait Displayed</dt>
          <dd>
            {
              metadata?.attributes.find(
                (attr) => attr.trait_type === 'Accessory',
              )?.value
            }
          </dd>
        </DescriptionList>
      </div>
    </div>
  );
}

export function CommunityHeaderManage() {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(null);

  useEffect(() => {
    async function getAccessories() {
      const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
      const accessoryIDs = await contract.getUnlockedAccessoriesForAddress(
        account?.address!,
      );

      const accessories = await Promise.all(
        accessoryIDs
          .filter((id) => !id.eq('-0x01'))
          .map((id) =>
            contract.accessoryIdToAccessory(id).then((val) => ({ ...val, id })),
          ),
      );

      setAccessories(accessories);
    }

    if (account?.address) {
      getAccessories();
      getMetadata(account.address).then(setMetadata);
    }
  }, [account?.address]);

  // TODO: use to disable update button when same as selected
  const currentAccessory = useMemo(() => {
    if (metadata && accessories) {
      const accessory = metadata.attributes.find(
        ({ trait_type }) => trait_type === 'Accessory',
      );
      return accessories.find((acc) => acc.name === accessory?.value) || null;
    }
    return null;
  }, [accessories, metadata]);

  const setAccessory = useCallback(
    async (acc: Accessory | null) => {
      const contract = web3CommunityNFT(signer!);
      const tx = await contract.setEnabledAccessory(acc ? acc.id : 0);
      tx.wait().then(() => getMetadata(account?.address!).then(setMetadata));
    },
    [account?.address, signer],
  );

  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null,
  );

  const accessoryOptions = useMemo(() => {
    const options = accessories.map((accessory) => {
      return {
        value: accessory,
        label: accessory.name,
      };
    });

    return [
      {
        value: null,
        label: 'No special trait',
      },
      ...options,
    ];
  }, [accessories]);

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
              options={accessoryOptions}
              onChange={(option) => setSelectedAccessory(option?.value || null)}
            />
          </dd>
        </DescriptionList>
        <Button onClick={() => setAccessory(selectedAccessory)}>
          Update Art
        </Button>
      </div>
    </div>
  );
}

type CommunityHeaderConnectedProps = {
  hasNFT: boolean;
  setHasNFT: (value: boolean) => void;
};
function CommunityHeaderConnected({
  hasNFT,
  setHasNFT,
}: CommunityHeaderConnectedProps) {
  if (hasNFT) {
    return <CommunityHeaderManage />;
  }

  return <CommunityHeaderMint setHasNFT={setHasNFT} />;
}

export function CommunityHeader() {
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

  if (onRequiredNetwork) {
    return <CommunityHeaderConnected hasNFT={hasNFT} setHasNFT={setHasNFT} />;
  }

  return <CommunityHeaderDisconnected />;
}
