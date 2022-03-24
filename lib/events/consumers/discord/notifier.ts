import Discord from 'discord.js';

export async function sendBotMessage(content: string) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  await (
    client.channels.cache.get(
      process.env.NEXT_PUBLIC_BACKED_UPDATES_CHANNEL_ID!,
    ) as Discord.TextChannel
  ).send(content);
}
