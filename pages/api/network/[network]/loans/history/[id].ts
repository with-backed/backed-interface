import { Event } from 'types/Event';
import { NextApiRequest, NextApiResponse } from 'next';
import { nodeLoanEventsById } from 'lib/loans/node/nodeLoanEventsById';
import { captureException, withSentry } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Event[] | null>,
) {
  try {
    validateNetwork(req.query);
    const { id, network } = req.query as {
      id: string;
      network: SupportedNetwork;
    };
    const idString: string = Array.isArray(id) ? id[0] : id;
    const config = configs[network];

    const events = await nodeLoanEventsById(idString, config.jsonRpcProvider);

    res.status(200).json(events);
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
