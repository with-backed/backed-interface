import { TwitterClient } from 'twitter-api-client';

export async function tweet(
  content: string,
  imageAttachment: string | undefined,
) {
  const client = new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  const mediaIdRes = await client.media.mediaUpload({
    media_data: imageAttachment,
  });

  await client.tweetsV2.createTweet({
    text: content,
    media: {
      media_ids: [mediaIdRes.media_id_string],
    },
  });
}
