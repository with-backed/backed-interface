import { captureException } from '@sentry/nextjs';
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
import { clientFromUrl } from './urql';

export type CommunityCategoryScoreChange = Omit<CategoryScoreChange, 'account'>;
export type CommunityToken = Pick<Token, 'id' | 'uri'>;
export type CommunityAccount = Pick<Account, 'id' | 'categoryScoreChanges'> & {
  token: CommunityToken;
};
export type AccessoryLookup = Record<string, Accessory | undefined>;

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
