import { captureException } from '@sentry/nextjs';
import {
  Account,
  CategoryScoreChange,
  CommunityAccountDocument,
  CommunityAccountQuery,
  QueryAccountArgs,
  Token,
} from 'types/generated/graphql/communitysubgraph';
import { clientFromUrl } from './urql';

export type CommunityCategoryScoreChange = Omit<CategoryScoreChange, 'account'>;
export type CommunityToken = Pick<Token, 'id' | 'uri'>;
export type CommunityAccount = Pick<Account, 'id' | 'categoryScoreChanges'> & {
  token: CommunityToken;
};

export async function getCommunityAccountInfo(
  address: string,
  communityNFTSubgraph: string,
): Promise<CommunityAccount | null> {
  const queryArgs: QueryAccountArgs = { id: address };
  const communityClient = clientFromUrl(communityNFTSubgraph);

  const result = await communityClient
    .query<CommunityAccountQuery>(CommunityAccountDocument, queryArgs)
    .toPromise();

  if (result.error) {
    captureException(result.error);
  }

  return (result.data?.account as CommunityAccount) || null;
}
