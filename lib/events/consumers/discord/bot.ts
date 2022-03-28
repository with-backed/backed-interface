import Discord from 'discord.js';

export async function sendBotMessage(content: string) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  const channel = (await client.channels.cache.find(
    (c) => c.id === process.env.NEXT_PUBLIC_BACKED_UPDATES_CHANNEL_ID!,
  )) as Discord.TextChannel;

  console.log({
    isChannelDefined: !!channel,
    name: client.user?.tag || 'undefined name',
  });

  await channel.send(content);
}
