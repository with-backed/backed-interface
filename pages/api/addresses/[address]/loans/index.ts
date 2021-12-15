import { LoanInfo } from 'lib/LoanInfoType';
import { getAllLoansForAddress } from 'lib/loans/getAllLoansForAddress';
import { NextApiRequest, NextApiResponse } from 'next';
import { CompositeGroup } from 'reakit/ts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoanInfo[]>,
) {
  try {
    const { address } = req.query;
    const loans = await getAllLoansForAddress(address);
    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
