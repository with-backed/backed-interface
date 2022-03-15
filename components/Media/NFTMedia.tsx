import { Media } from 'components/Media';
import { Fallback } from './Fallback';
import { MaybeNFTMetadata } from 'hooks/useTokenMetadata';

interface NFTMediaProps {
  nftInfo: MaybeNFTMetadata;
  small?: boolean;
}

export function NFTMedia({ nftInfo, small = false }: NFTMediaProps) {
  const { isLoading, metadata } = nftInfo;

  if (!metadata) {
    return <Fallback small={small} animated={isLoading} />;
  }

  return (
    <Media
      media={metadata.mediaUrl}
      mediaMimeType={metadata.mediaMimeType}
      autoPlay={false}
    />
  );
}
