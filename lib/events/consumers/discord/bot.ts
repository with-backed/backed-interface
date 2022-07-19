import Discord, { MessageEmbed } from 'discord.js';
import { DiscordMetric } from 'lib/events/consumers/discord/shared';

export async function sendBotMessage(
  content: string,
  channelID: string,
  messageEmbed?: MessageEmbed,
) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  const channel = (await client.channels.fetch(
    channelID,
  )) as Discord.TextChannel;

  await channel.send(content, {
    embed: !!messageEmbed ? messageEmbed : undefined,
  });
}

export async function updateWatcher(metric: DiscordMetric, value: number) {
  const client = new Discord.Client();

  switch (metric) {
    case DiscordMetric.NUM_LOANS_CREATED:
      await client.login(process.env.DISCORD_NUM_LOANS_CREATED_TOKEN!);

      await client.user!.setPresence({
        activity: {
          name: `${pluralizeLoans(value)} created this week`,
          type: 'WATCHING',
        },
        status: 'online',
      });
      break;
    case DiscordMetric.NUM_LOANS_LENT_TO:
      await client.login(process.env.DISCORD_NUM_LOANS_LENT_TO_TOKEN!);

      await client.user!.setPresence({
        activity: {
          name: `${pluralizeLoans(value)} lent to this week`,
          type: 'WATCHING',
        },
        status: 'online',
      });
      break;
    case DiscordMetric.DOLLAR_LOANS_LENT_TO:
      await client.login(process.env.DISCORD_DOLLAR_LOANS_LENT_TO_TOKEN!);

      await client.user!.setPresence({
        activity: {
          name: `$${value.toFixed(2)} lent this week`,
          type: 'WATCHING',
        },
        status: 'online',
      });
      break;
  }
}

const pluralizeLoans = (num: number): string =>
  num === 1 ? `${num} loan` : `${num} loans`;
