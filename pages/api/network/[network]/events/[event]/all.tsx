import { NextApiRequest, NextApiResponse } from 'next';
import subgraphLoans from 'lib/loans/subgraph/subgraphLoans';
import {
  Loan,
  Loan_OrderBy,
  OrderDirection,
  LendEvent,
  CreateEvent,
  BuyoutEvent,
  RepaymentEvent,
  CollateralSeizureEvent,
} from 'types/generated/graphql/nftLoans';
import { captureException, withSentry } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';
import {
  getLendEventsSince,
  getCreateEventsSince,
  getRepaymentEventsSince,
  getBuyoutEventsSince,
  getCollateralSeizureEventsSince,
} from 'lib/eventsHelpers';
import { RawEventNameType } from 'types/RawEvent';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | CreateEvent[]
    | LendEvent[]
    | BuyoutEvent[]
    | RepaymentEvent[]
    | CollateralSeizureEvent[]
    | null
  >,
) {
  try {
    validateNetwork(req.query);
    const { network, event } = req.query as {
      network: SupportedNetwork;
      event: RawEventNameType;
    };
    const config = configs[network];

    if (event === 'CreateEvent') {
      res.status(200).json(await getCreateEventsSince(config, 0));
    } else if (event === 'LendEvent') {
      res.status(200).json(await getLendEventsSince(config, 0));
    } else if (event === 'BuyoutEvent') {
      res.status(200).json(await getBuyoutEventsSince(config, 0));
    } else if (event === 'RepaymentEvent') {
      res.status(200).json(await getRepaymentEventsSince(config, 0));
    } else if (event === 'CollateralSeizureEvent') {
      res.status(200).json(await getCollateralSeizureEventsSince(config, 0));
    } else {
      res.status(401);
    }
  } catch (e) {
    captureException(e);
    res.status(404);
  }
}

export default withSentry(handler);
