import { MessageAttachment, MessageEmbed } from 'discord.js';
import ethers from 'ethers';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';
import sharp from 'sharp';

const SVG_PREFIX = 'data:image/svg+xml;base64,';
const JSON_PREFIX = 'data:application/json;base64,';

export async function collateralToDiscordMessageEmbed(
  collateralName: string,
  collateralTokenId: ethers.BigNumber,
  collateralTokenURI: string,
): Promise<MessageEmbed | undefined> {
  let NFTInfo: NFTResponseData;

  const isDataUri = collateralTokenURI.startsWith('data:');

  if (isDataUri) {
    NFTInfo = JSON.parse(
      Buffer.from(
        collateralTokenURI.substring(JSON_PREFIX.length),
        'base64',
      ).toString(),
    );
  } else {
    const tokenURIRes = await fetch(
      isDataUri
        ? collateralTokenURI
        : `https://rinkeby.withbacked.xyz/api/nftInfo/${encodeURIComponent(
            collateralTokenURI,
          )}`,
    );
    NFTInfo = await tokenURIRes.json();
  }

  if (!NFTInfo) {
    return undefined;
  }

  let rawBufferAttachment: MessageAttachment | undefined = undefined;
  let messageEmbed: MessageEmbed;

  if (NFTInfo.image.startsWith(SVG_PREFIX)) {
    const outputBuffer = await sharp(
      Buffer.from(NFTInfo.image.substring(SVG_PREFIX.length), 'base64'),
    )
      .png()
      .toBuffer();

    rawBufferAttachment = new MessageAttachment(outputBuffer, `collateral.png`);
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .attachFiles([rawBufferAttachment])
      .setImage('attachment://collateral.png');
  } else {
    messageEmbed = new MessageEmbed()
      .setTitle(`${collateralName} #${collateralTokenId}`)
      .setImage(NFTInfo.image);
  }

  return messageEmbed;
}
