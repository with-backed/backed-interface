import { NextApiRequest, NextApiResponse } from 'next';
import { generateFakeSaleForNFT, NFTSaleEntity } from 'lib/eip721Sales';

export type SalesResponseData = {
  sales: NFTSaleEntity[];
} | null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SalesResponseData>,
) {
  const { contractAddress, tokenId } = req.query;
  try {
    res.status(200).json({
      sales: [
        generateFakeSaleForNFT(contractAddress as string, tokenId as string),
      ],
    });
  } catch (e) {
    console.error(e);
    res.status(404);
  }
}
