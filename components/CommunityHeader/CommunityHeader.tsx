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
import { CommunityNFT } from 'types/generated/abis';
import { AccessoryLookup, CommunityAccount } from 'lib/community';
import { Accessory } from 'types/generated/graphql/communitysubgraph';
import Link from 'next/link';

// TODO: optimism for launch
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
        setHasNFT('true');
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
  return parseMetadata(uri);
}

function parseMetadata(dataUri: string) {
  const buffer = Buffer.from(dataUri.split(',')[1], 'base64');
  return JSON.parse(buffer.toString());
}

async function getAccessories(
  address: string,
  accessoryLookup: AccessoryLookup,
) {
  const contract = jsonRpcCommunityNFT(JSON_RPC_PROVIDER);
  const accessoryIDs = await contract.getUnlockedAccessoriesForAddress(address);

  return accessoryIDs
    .filter((id) => !id.eq(0))
    .reduce((result, id) => {
      let accessory = accessoryLookup[id.toString()];
      if (accessory) {
        return [...result, accessory];
      }
      return result;
    }, [] as Accessory[]);
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
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(
    account ? parseMetadata(account.token.uri) : null,
  );
  useEffect(() => {
    getAccessories(address, accessoryLookup).then(setAccessories);
    if (!account) {
      // no data from graph, fall back to node
      getMetadata(address).then(setMetadata);
    }
  }, [account, address, accessoryLookup]);

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
          <dt>Special Traits Earned</dt>
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
  const { data: wagmiAccount } = useAccount();
  const { data: signer } = useSigner();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [metadata, setMetadata] = useState<CommunityTokenMetadata | null>(
    account ? parseMetadata(account.token.uri) : null,
  );

  useEffect(() => {
    if (wagmiAccount?.address) {
      getAccessories(wagmiAccount.address, accessoryLookup).then(
        setAccessories,
      );
      if (!account) {
        // no data from graph, fall back to node
        getMetadata(wagmiAccount.address).then(setMetadata);
      }
    }
  }, [account, wagmiAccount?.address, accessoryLookup]);

  const setAccessory = useCallback(
    async (acc: Accessory | null) => {
      const contract = web3CommunityNFT(signer!);
      const tx = await contract.setEnabledAccessory(acc ? acc.id : 0);
      tx.wait().then(() =>
        getMetadata(wagmiAccount?.address!).then(setMetadata),
      );
    },
    [wagmiAccount?.address, signer],
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
          alt={`Community NFT for ${wagmiAccount?.address}`}
          src={metadata.image as string}
        />
      ) : (
        <PlaceholderBunn />
      )}
      <div className={styles.cta}>
        <h3>🖼🐇 Community NFT</h3>
        <DescriptionList>
          <dt>Address</dt>
          <dd>{wagmiAccount?.address}</dd>
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
  const { data: wagmiAccount } = useAccount();
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

  const viewerIsHolder = wagmiAccount?.address === address;

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
