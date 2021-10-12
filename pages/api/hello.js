// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NFTData } from '@nfte/handler';
import { ethers } from 'ethers';
import Cors from 'cors';
import ERC721Artifact from '../../contracts/ERC721.json';
import getNFTInfo from '../../lib/getNFTInfo';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

import initMiddleware from '../../lib/init-middleware';

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

export default async function handler(req, res) {
  await cors(req, res);

  // console.log(req.query)
  const pawnTicketsContract = new ethers.Contract(
    req.query.collateralAddress,
    ERC721Artifact.abi,
    _provider,
  );
  // pawnTicketsContract.tokenURI(req.query.collateralID).then(res => {
  //     console.log(res)
  //     fetch(res)
  //         .then(response => response.json())
  //         .then(data => {
  //             fetch(data["image"], { method: "HEAD" }).then(res => {
  //                 console.log(res.headers.get("Content-Type"))
  //             })
  //         });
  // })
  const nftData = await getNFTInfo({
    Contract: pawnTicketsContract,
    tokenId: req.query.collateralID,
  });
  // new NFTData({ _provider, _provider })
  // const data = nftData.getData({ contract: req.query.collateralAddress, tokenId: req.query.collateralID }).then(
  //     (res) => {
  //         console.log(res)
  //     }
  // )
  // console.log("---")
  console.log(nftData);
  // const
  res.statusCode = 200;
  res.json({ name: 'John Doe' });
}
