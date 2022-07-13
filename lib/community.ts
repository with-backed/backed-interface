import { captureException } from '@sentry/nextjs';
import { CommunityNFT } from 'types/generated/abis';
import {
  AccessoriesDocument,
  AccessoriesQuery,
  Accessory,
  Account,
  CategoryScoreChange,
  CommunityAccountDocument,
  CommunityAccountQuery,
  CommunityAccountQueryVariables,
  Token,
} from 'types/generated/graphql/communitysubgraph';
import { jsonRpcCommunityNFT } from './contracts';
import { convertIPFS } from './getNFTInfo';
import { clientFromUrl } from './urql';

export type CommunityCategoryScoreChange = Omit<CategoryScoreChange, 'account'>;
export type CommunityToken = Pick<Token, 'id' | 'uri' | 'mintedAt'>;
export type CommunityAccount = Pick<Account, 'id' | 'categoryScoreChanges'> & {
  token: CommunityToken;
};
export type AccessoryLookup = Record<string, Accessory | undefined>;
export type CommunityTokenMetadata = {
  attributes: { trait_type: string; value: string | number }[];
  description: string;
  image: string;
  name: string;
};

export async function getCommunityAccountInfo(
  address: string,
  communityNFTSubgraph: string,
): Promise<CommunityAccount | null> {
  const queryArgs: CommunityAccountQueryVariables = { address };
  const communityClient = clientFromUrl(communityNFTSubgraph);

  const result = await communityClient
    .query<CommunityAccountQuery>(CommunityAccountDocument, queryArgs)
    .toPromise();

  if (result.error) {
    captureException(result.error);
  }

  return (result.data?.account as CommunityAccount) || null;
}

export async function getAccessoryLookup(
  communityNFTSubgraph: string,
): Promise<AccessoryLookup> {
  const communityClient = clientFromUrl(communityNFTSubgraph);
  const result = await communityClient
    .query<AccessoriesQuery>(AccessoriesDocument)
    .toPromise();

  if (result.error) {
    captureException(result.error);
  }

  if (result.data?.accessories) {
    return result.data.accessories.reduce(
      (result, accessory) => ({
        ...result,
        [accessory.id]: accessory,
        [accessory.name]: accessory,
        [accessory.contractAddress]: accessory,
      }),
      {} as AccessoryLookup,
    );
  }

  return {};
}

export async function getTokenID(contract: CommunityNFT, address: string) {
  const nonce = (await contract.nonce()).toNumber();
  for (let i = 0; i < nonce; ++i) {
    const owner = await contract.ownerOf(i);
    if (owner === address) {
      return i;
    }
  }
  return -1;
}

export async function getMetadata(
  address: string,
  jsonRpcProvider: string,
): Promise<CommunityTokenMetadata> {
  const contract = jsonRpcCommunityNFT(jsonRpcProvider);
  const tokenID = await getTokenID(contract, address);
  const uri = await contract.tokenURI(tokenID);
  return parseMetadata(uri);
}

export function parseMetadata(dataUri: string) {
  const buffer = Buffer.from(dataUri.split(',')[1], 'base64');
  return JSON.parse(buffer.toString());
}

export async function getAccessories(
  address: string,
  accessoryLookup: AccessoryLookup,
  jsonRpcProvider: string,
) {
  const contract = jsonRpcCommunityNFT(jsonRpcProvider);
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

export async function getReasons(account: CommunityAccount) {
  const changes = account.categoryScoreChanges || [];
  const addresses = changes
    .map(({ ipfsLink }) => convertIPFS(ipfsLink))
    .filter((item) => !!item) as string[];

  const responses = await Promise.all(addresses.map((add) => fetch(add)));
  const jsons = await Promise.all(responses.map((res) => res.json()));

  console.log({ jsons });

  return jsons.reduce((prev, curr) => ({ ...prev, ...curr }));
}
