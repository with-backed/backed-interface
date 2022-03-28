import Discord, { MessageAttachment, MessageEmbed } from 'discord.js';

export async function sendBotMessage(
  content: string,
  messageEmbed: MessageEmbed,
  rawBufferAttachment?: MessageAttachment,
) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  const channel = (await client.channels.fetch(
    process.env.NEXT_PUBLIC_BACKED_UPDATES_CHANNEL_ID!,
  )) as Discord.TextChannel;

  await channel.send(content, {
    embed: messageEmbed,
    files: !!rawBufferAttachment ? [rawBufferAttachment] : undefined,
  });
}
