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
    //   console.log("!!!")
    //   console.log(req.query)
    //   const decodedAccount = decodeURIComponent(account as string);
    //   console.log(account)
    //   console.log(decodedAccount)
    const loans = await getAllLoansForAddress(address);
    res.status(200).json(loans);
  } catch (e) {
    // TODO: bugsnag
    console.error(e);
    res.status(404);
  }
}
