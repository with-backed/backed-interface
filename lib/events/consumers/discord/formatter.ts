import { LendEvent } from 'types/generated/graphql/nftLoans';
import { RawSubgraphEvent } from 'types/RawEvent';
import { generateContentStringForEvent } from 'lib/events/consumers/formattingHelpers';
import { NotificationTriggerType } from 'lib/events/consumers/userNotifications/shared';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';
import { collateralToDiscordMessageEmbed } from 'lib/events/consumers/discord/attachments';
import { getNFTInfoForAttachment } from '../getNftInfoForAttachment';

export async function sendBotUpdateForTriggerAndEntity(
  trigger: NotificationTriggerType,
  event: RawSubgraphEvent,
  now: number,
  mostRecentTermsEvent?: LendEvent,
): Promise<void> {
  // we do not want to send LendEvent bot messages and BuyoutEvent bot messages
  if (trigger === 'LendEvent' && !!mostRecentTermsEvent) {
    return;
  }

  const botMessageContent = await generateContentStringForEvent(
    trigger,
    event,
    boldTextForDiscord,
    formatLinkForDiscord,
    mostRecentTermsEvent,
  );

  const messagedEmbed = await collateralToDiscordMessageEmbed(
    await getNFTInfoForAttachment(event.loan.collateralTokenURI),
    event.loan.collateralName,
    event.loan.collateralTokenId,
  );

  await sendBotMessage(botMessageContent, messagedEmbed);
}

const formatLinkForDiscord = (link: string) => `<${link}>`;
const boldTextForDiscord = (text: string) => `**${text}**`;
