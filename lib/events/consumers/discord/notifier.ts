import Discord from 'discord.js';

export async function sendBotMessage(content: string) {
  const client = new Discord.Client();
  await client.login(process.env.DISCORD_BOT_TOKEN!);

  console.log('outside the ready');

  let clientReady = false;
  client.once('ready', async () => {
    console.log('inside the ready');
    clientReady = true;
  });

  while (!clientReady) {}

  await (
    client.channels.cache.get('956571169753026701') as Discord.TextChannel
  ).send(content);
}
