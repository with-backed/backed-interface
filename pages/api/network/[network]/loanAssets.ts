import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import type { LoanAsset } from 'lib/loanAssets';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

// TODO: we should almost certainly cache this
const mainnetLoanAssetsURI = 'https://tokens.1inch.eth.link/';
const optimismLoanAssetURI =
  'https://static.optimism.io/optimism.tokenlist.json';
const polygonLoanAssetURI =
  'https://api-polygon-tokens.polygon.technology/tokenlists/default.tokenlist.json';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoanAsset[] | null>,
) {
  try {
    validateNetwork(req.query);
    const { network } = req.query;
    const { network: configNetwork } = configs[network as SupportedNetwork];
    let assets: LoanAsset[] = [];
    switch (configNetwork) {
      case 'rinkeby':
        assets = [
          {
            address: '0x6916577695D0774171De3ED95d03A3239139Eddb',
            symbol: 'DAI',
            chainId: 4,
          },
        ];
        break;
      case 'ethereum':
        assets = (await loadJson(mainnetLoanAssetsURI)).filter(
          (asset) => asset.chainId === 1,
        );
        break;
      case 'optimism':
        assets = (await loadJson(optimismLoanAssetURI)).filter(
          (asset) => asset.chainId === 10,
        );

        break;
      case 'polygon':
        assets = (await loadJson(polygonLoanAssetURI)).filter(
          (asset) => asset.chainId === 137,
        );

        break;
    }
    return res.status(200).json(assets);
  } catch (e) {
    captureException(e);
    return res.status(404).json(null);
  }
}

function isLoanAssets(array: LoanAsset[] | any): array is LoanAsset[] {
  return (
    array.length &&
    typeof array[0].address === 'string' &&
    typeof array[0].symbol === 'string' &&
    typeof array[0].chainId === 'number'
  );
}

const loadJson = async (uri: string): Promise<LoanAsset[]> => {
  const response = await fetch(uri);
  const json = await response.json();
  if (!json) {
    throw new Error(`loanAssets: Response from ${uri} was null.`);
  }

  if (isLoanAssets(json.tokens)) {
    return json.tokens;
  } else {
    throw new Error(
      `loanAssets: Response from ${uri} did not include valid tokens.`,
    );
  }
};

export default withSentry(handler);
