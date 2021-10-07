import React, { useEffect, useState } from "react"
import ERC721Artifact from "../../contracts/ERC721.json";
import getNFTInfo, { GetNFTInfoResponse } from "../../lib/getNFTInfo"
import Media from "../Media"
import { ethers } from "ethers";
import NFTPawnShopArtifact from "../../contracts/NFTPawnShop.json";

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const pawnTicketsContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PAWN_TICKETS_CONTRACT,
    ERC721Artifact.abi,
    _provider
  );

const pawnLoansContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PAWN_LOANS_CONTRACT,
    ERC721Artifact.abi,
    _provider
  );

export function PawnLoanArt({tokenId}){
    return(
        <PawnArt contract={pawnLoansContract} tokenId={tokenId} />
    )
}

export function PawnTicketArt({tokenId}){
    return(
        <PawnArt contract={pawnTicketsContract} tokenId={tokenId} />
    )
}

function PawnArt({contract, tokenId}){
    const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse>(null)
    const [owner, setOwner] = useState('')

	const load = async () => {
		const result = await getNFTInfo({Contract: contract, tokenId: tokenId})
        const owner = await contract.ownerOf(tokenId)
        setOwner(owner)
		setNFTInfo(result)
    }

    React.useEffect(() => {
		load()
	}, [])
   
    return(
        <div className="pawn-art" >
            
        {
            nftInfo == null ? 
            "" :
            <div>
            <PawnArtLoaded {...nftInfo} />
            
            </div>
        }
        </div>
    )

}

function PawnArtLoaded(nftInfo: GetNFTInfoResponse){
    return(
        <div>
            <div className="pawn-art nfte__media">
            <Media
                media={nftInfo.mediaUrl}
                mediaMimeType={nftInfo.mediaMimeType}
                autoPlay={false}
            />
            </div>
        </div>
    )
}
