import { NextApiRequest, NextApiResponse } from 'next';
import { captureException, withSentry } from '@sentry/nextjs';
import type { LoanAsset } from 'lib/loanAssets';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

// TODO: we should almost certainly cache this
// TODO: optimism, polygon...
const mainnetLoanAssetsURI = 'https://tokens.1inch.eth.link/';

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
          },
        ];
        break;
      case 'ethereum':
        assets = await loadJson(mainnetLoanAssetsURI);
        break;
    }
    return res.status(200).json(assets);
  } catch (e) {
    console.log({ e });
    captureException(e);
    return res.status(404).json(null);
  }
}

function isLoanAssets(array: LoanAsset[] | any): array is LoanAsset[] {
  return (
    array.length &&
    typeof array[0].address === 'string' &&
    typeof array[0].symbol === 'string'
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
