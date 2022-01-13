import { Event } from 'types/Event';
import { NextApiRequest, NextApiResponse } from 'next';
import { nodeLoanEventsById } from 'lib/loans/node/nodeLoanEventsById';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Event[] | null>,
) {
  try {
    const { id } = req.query;
    const idString: string = Array.isArray(id) ? id[0] : id;

    const events = await nodeLoanEventsById(idString);

    res.status(200).json(events);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
