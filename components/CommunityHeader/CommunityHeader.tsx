import { Button, TransactionButton } from 'components/Button';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './CommunityHeader.module.css';
import { PlaceholderBunn } from './PlaceholderBunn';
import optimismCircle from './optimism-circle.png';
import { configs } from 'lib/config';
import { useAccount, useSigner } from 'wagmi';
import { jsonRpcCommunityNFT, web3CommunityNFT } from 'lib/contracts';
import { DescriptionList } from 'components/DescriptionList';
import { Select } from 'components/Select';
import { captureException } from '@sentry/nextjs';
import {
  AccessoryLookup,
  CommunityAccount,
  CommunityTokenMetadata,
  getAccessories,
  getMetadata,
} from 'lib/community';
import { Accessory } from 'types/generated/graphql/communitysubgraph';
import Link from 'next/link';
import { NFTExchangeAddressLink } from 'components/NFTExchangeLink';
import { COMMUNITY_NFT_CONTRACT_ADDRESS } from 'lib/constants';

const JSON_RPC_PROVIDER = configs.optimism.jsonRpcProvider;

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

export function CommunityHeaderNotMinted() {
  return (
    <div className={styles['not-minted-wrapper']}>
      <h1>This address has not yet minted.</h1>
      <PlaceholderBunn />
    </div>
  );
}

export function CommunityHeaderDisconnected() {
  return (
    <div className={styles.wrapper}>
      <PlaceholderBunn />
      <div className={styles.cta}>
        <CTAContent />
        <Button disabled>Mint for Free</Button>

        <p className={styles['connect-wallet']}>
          To mint, you&apos;ll need ETH on{' '}
          <Image src={optimismCircle} alt="" height={18} width={18} /> Optimism
          for gas. Use the{' '}
          <Link href="https://app.optimism.io/bridge">
            <a className={styles.link}>Optimism Bridge</a>
          </Link>{' '}
          to move ETH between networks.
        </p>
      </div>
    </div>
  );
}

type CommunityHeaderMintProps = {
  setHasNFT: (value: MaybeBoolean) => void;
};
function CommunityHeaderMint({ setHasNFT }: CommunityHeaderMintProps) {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [txHash, setTxHash] = useState('');
  const [isPending, setIsPending] = useState(false);

  const mint = useCallback(async () => {
    const contract = web3CommunityNFT(signer!);
    const tx = await contract.mint(address!);
    setTxHash(tx.hash);
    setIsPending(true);
    tx.wait()
      .then(() => {
        setHasNFT('true');
        setIsPending(false);
      })
      .catch((reason) => captureException(reason));
  }, [address, setHasNFT, signer]);

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
        {!isPending && (
          <p className={styles['connect-wallet']}>
            To mint, you&apos;ll need ETH on{' '}
            <Image src={optimismCircle} alt="" height={18} width={18} />{' '}
            Optimism for gas. Use the{' '}
            <Link href="https://app.optimism.io/bridge">
              <a className={styles.link}>Optimism Bridge</a>
            </Link>{' '}
            to move ETH between networks.
          </p>
        )}
      </div>
    </div>
  );
}

type CommunityPageViewProps = {
  account: CommunityAccount | null;
  address: string;
  accessoryLookup: AccessoryLookup;
};
export function CommunityHeaderView({
  account,
  address,
  accessoryLookup,
}: CommunityPageViewProps) {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(null);
  useEffect(() => {
    getAccessories(address, accessoryLookup, JSON_RPC_PROVIDER).then(
      setAccessories,
    );
    getMetadata(address, JSON_RPC_PROVIDER).then(setMetadata);
  }, [address, accessoryLookup]);

  const joined = useMemo(
    () =>
      account?.token?.mintedAt
        ? new Date(account.token.mintedAt * 1000).toLocaleDateString()
        : '--',
    [account],
  );

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
        <NFTExchangeAddressLink
          contractAddress={COMMUNITY_NFT_CONTRACT_ADDRESS}
          assetId={account?.token.id || ''}
        />
        <DescriptionList>
          <dt>Address</dt>
          <dd>{address}</dd>
          <dt>Joined</dt>
          <dd>{joined}</dd>
          <dt>Special Accessories Earned</dt>
          <dd>
            <ul>
              {accessories.map((acc) => {
                return <li key={acc.id.toString()}>{acc.name}</li>;
              })}
            </ul>
          </dd>
        </DescriptionList>
      </div>
    </div>
  );
}

type CommunityHeaderManageProps = {
  account: CommunityAccount | null;
  accessoryLookup: AccessoryLookup;
};
export function CommunityHeaderManage({
  account,
  accessoryLookup,
}: CommunityHeaderManageProps) {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(null);

  useEffect(() => {
    if (address) {
      getAccessories(address, accessoryLookup, JSON_RPC_PROVIDER).then(
        setAccessories,
      );
      getMetadata(address, JSON_RPC_PROVIDER).then(setMetadata);
    }
  }, [address, accessoryLookup]);

  const setAccessory = useCallback(
    async (acc: Accessory | null) => {
      const contract = web3CommunityNFT(signer!);
      const tx = await contract.setEnabledAccessory(acc ? acc.id : 0);
      tx.wait().then(() =>
        getMetadata(address!, JSON_RPC_PROVIDER).then(setMetadata),
      );
    },
    [address, signer],
  );

  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null,
  );

  const currentAccessoryName = useMemo(() => {
    if (metadata) {
      const accessoryTrait = metadata.attributes.find(
        (attr) => attr.trait_type === 'Accessory',
      );
      return accessoryTrait?.value;
    }
    return undefined;
  }, [metadata]);

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

  const defaultValue = useMemo(() => {
    if (currentAccessoryName || currentAccessoryName === '') {
      return (
        accessoryOptions.find((opt) => opt.label === currentAccessoryName) || {
          value: null,
          label: 'No special trait',
        }
      );
    }
    return null;
  }, [accessoryOptions, currentAccessoryName]);

  const joined = useMemo(
    () =>
      account?.token?.mintedAt
        ? new Date(account.token.mintedAt * 1000).toLocaleDateString()
        : '--',
    [account],
  );

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
        <NFTExchangeAddressLink
          contractAddress={COMMUNITY_NFT_CONTRACT_ADDRESS}
          assetId={account?.token.id || ''}
        />
        <DescriptionList>
          <dt>Address</dt>
          <dd>{address}</dd>
          <dt>Joined</dt>
          <dd>{joined}</dd>
          <dt>Special Trait Displayed</dt>
          <dd>
            {defaultValue && (
              <Select
                className={styles.select}
                color="clickable"
                options={accessoryOptions}
                defaultValue={defaultValue}
                onChange={(option) =>
                  setSelectedAccessory(option?.value || null)
                }
              />
            )}
          </dd>
        </DescriptionList>
        <Button
          disabled={currentAccessoryName === selectedAccessory?.name}
          onClick={() => setAccessory(selectedAccessory)}>
          Update Art
        </Button>
      </div>
    </div>
  );
}

type MaybeBoolean = 'true' | 'false' | 'unknown';

type CommunityHeaderProps = {
  address: string;
  account: CommunityAccount | null;
  accessoryLookup: AccessoryLookup;
};
export function CommunityHeader({
  account,
  address,
  accessoryLookup,
}: CommunityHeaderProps) {
  const { address: connectedAddress } = useAccount();
  const [hasNFT, setHasNFT] = useState<MaybeBoolean>('unknown');

  useEffect(() => {
    const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
    async function checkNFT() {
      const tokenCount = await contract.balanceOf(address);
      if (tokenCount.gt(0)) {
        setHasNFT('true');
      } else {
        setHasNFT('false');
      }
    }

    checkNFT();
  }, [address]);

  const viewerIsHolder = connectedAddress === address;

  if (hasNFT === 'unknown') {
    return <CommunityHeaderDisconnected />;
  }

  if (hasNFT === 'true') {
    if (viewerIsHolder) {
      return (
        <CommunityHeaderManage
          account={account}
          accessoryLookup={accessoryLookup}
        />
      );
    } else {
      return (
        <CommunityHeaderView
          account={account}
          address={address}
          accessoryLookup={accessoryLookup}
        />
      );
    }
  }

  if (hasNFT === 'false' && viewerIsHolder) {
    return <CommunityHeaderMint setHasNFT={setHasNFT} />;
  }

  return <CommunityHeaderNotMinted />;
}
