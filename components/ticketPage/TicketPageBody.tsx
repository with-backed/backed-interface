import React, { useEffect, useState } from "react"
import CollateralMediaCard from "./CollateralMediaCard"
import { ethers } from "ethers";
import {PawnLoanArt, PawnTicketArt} from "./PawnArt";
import UnderwriteCard from "./UnderwriteCard";
import { getTicketInfo } from "../../lib/tickets";
import { TicketInfo } from "../../lib/TicketInfoType";
import RepayCard from "./RepayCard";
import TicketHistory from "./TicketHistory";
import SeizeCollateralCard from "./SeizeCollateralCard";
import { erc721Contract, jsonRpcERC721Contract } from "../../lib/contracts";

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

interface TicketPageBodyProps {
    account: string, 
    ticketInfo: TicketInfo,
    refresh: () => void
  }
          

export default function TicketPageBody({account, ticketInfo, refresh}: TicketPageBodyProps){
	return(
		<div id='ticket-page'>
            <LeftColumn account={account} ticketInfo={ticketInfo} refresh={refresh} />
			<div className='float-left'><CollateralMediaCard  collateralAddress={ticketInfo.collateralAddress} collateralID={ticketInfo.collateralID} /></div>
            <RightColumn account={account} ticketInfo={ticketInfo} refresh={refresh} />
		</div>
		)
}

function LeftColumn({account, ticketInfo, refresh}: TicketPageBodyProps) {
    const [owner, setOwner] = useState('')

    const getOwner = async  () => {
        const contract = jsonRpcERC721Contract(process.env.NEXT_PUBLIC_PAWN_TICKETS_CONTRACT)
        const o = await contract.ownerOf(ethers.BigNumber.from(ticketInfo.ticketNumber))
        setOwner(o)
    }

    useEffect(()=>{
        getOwner()
    })
    return(
        <div id='left-elements-wrapper' className='float-left'>
            <fieldset className='standard-fieldset'> 
                    <legend>pawn ticket</legend>
                    <p> This Pawn Ticket NFT is owned by {owner.slice(0,10)}... 
                    <br/>
                    <a target="_blank" href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${process.env.NEXT_PUBLIC_PAWN_TICKETS_CONTRACT}/${ticketInfo.ticketNumber}`}>View on OpenSea</a>
                    </p>
            </fieldset>
            
			<div> <PawnTicketArt tokenId={ticketInfo.ticketNumber} />	</div>
            { account == null || ticketInfo.closed || ticketInfo.lastAccumulatedTimestamp.toString() == '0' ? '' : <RepayCard account={account} ticketInfo={ticketInfo} repaySuccessCallback={refresh} /> }
            <TicketHistory ticketId={ticketInfo.ticketNumber} loanAssetDecimals={ticketInfo.loanAssetDecimals} />
        </div>
    )
}

function RightColumn({account, ticketInfo, refresh}: TicketPageBodyProps) {
    const [timestamp, setTimestamp] = useState(null)
    const [endSeconds, ] = useState(parseInt(ticketInfo.lastAccumulatedTimestamp.add(ticketInfo.durationSeconds).toString()))
    const [owner, setOwner] = useState('')

    const getOwner = async  () => {
        const contract = jsonRpcERC721Contract(process.env.NEXT_PUBLIC_PAWN_LOANS_CONTRACT)
        const o = await contract.ownerOf(ethers.BigNumber.from(ticketInfo.ticketNumber))
        setOwner(o)
    }

    const refreshTimestamp = async () => {
        const height = await _provider.getBlockNumber()
        const block = await _provider.getBlock(height)
        setTimestamp(block.timestamp)
        console.log(`timestamp ${block.timestamp}`)
    }

    useEffect(() => {
        getOwner()
        refreshTimestamp()
        const timeOutId = setInterval(() => refreshTimestamp(), 14000);
        return () => clearInterval(timeOutId);
      }, [ticketInfo]);

    return(
        <div id='right-elements-wrapper' className='float-left'>
            { ticketInfo.lastAccumulatedTimestamp.toString() == '0' ? '' : 
            <div>
                <fieldset className='standard-fieldset'> 
                    <legend>pawn loan</legend>
                    <p> This Pawn Loan NFT is owned by {owner.slice(0,10)}... 
                    <br/>
                    <a target="_blank" href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${process.env.NEXT_PUBLIC_PAWN_LOANS_CONTRACT}/${ticketInfo.ticketNumber}`}>View on OpenSea</a>
                    </p>
            </fieldset>
            <div id='pawn-loan-art'> <PawnLoanArt tokenId={ticketInfo.ticketNumber} />	</div> 
            </div>
            } 
            { account == null || ticketInfo.closed ? '' :
            <div>
                <UnderwriteCard account={account} ticketInfo={ticketInfo} loanUpdatedCallback={refresh}/>
                { ticketInfo.loanOwner != account || timestamp == null || timestamp <  endSeconds ? '' : <SeizeCollateralCard account={account} ticketInfo={ticketInfo} seizeCollateralSuccessCallback={refresh} /> }
            </div>
            }
        </div>
    )
}

