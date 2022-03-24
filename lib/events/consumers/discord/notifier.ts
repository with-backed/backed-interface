import Discord from 'discord.js';

export async function sendBotMessage(content: string) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  client.once('ready', () => {
    (
      client.channels.cache.get('956571169753026701') as Discord.TextChannel
    ).send(content);
  });
}
