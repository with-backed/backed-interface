import { RawSubgraphEvent } from 'types/RawEvent';
import { NotificationTriggerType } from 'lib/events/consumers/userNotifications/shared';
import { LendEvent } from 'types/generated/graphql/nftLoans';
import { tweet } from './api';
import { generateContentStringForEvent } from '../formattingHelpers';
import { getNFTInfoForAttachment } from '../getNftInfoForAttachment';
import { nftResponseDataToImageBuffer } from './attachments';

export async function sendTweetForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  mostRecentTermsEvent?: LendEvent,
) {
  // we do not want to tweet for LendEvent bot messages and BuyoutEvent bot messages
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  const tweetContent = await generateContentStringForEvent(
    trigger,
    event,
    boldCharactersForTwitter,
    formatLinkForTwitter,
    mostRecentTermsEvent,
  );

  const attachmentImageBuffer = await nftResponseDataToImageBuffer(
    await getNFTInfoForAttachment(event.loan.collateralTokenURI),
  );

  await tweet(tweetContent, attachmentImageBuffer);
}

const formatLinkForTwitter = (link: string) => link;

const boldCharactersForTwitter = (str: string): string => {
  const upperDiff = '𝗔'.codePointAt(0)! - 'A'.codePointAt(0)!;
  const lowerDiff = '𝗮'.codePointAt(0)! - 'a'.codePointAt(0)!;

  const isUpper = (n: number) => n >= 65 && n < 91;
  const isLower = (n: number) => n >= 97 && n < 123;

  const bolderize = (char: string) => {
    const n = char.charCodeAt(0);
    if (isUpper(n)) return String.fromCodePoint(n + upperDiff);
    if (isLower(n)) return String.fromCodePoint(n + lowerDiff);
    return char;
  };

  return str
    .split('')
    .map((char) => bolderize(char))
    .join('');
};
