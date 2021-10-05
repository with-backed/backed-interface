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

function LeftColumn({account, ticketInfo, refresh}) {
    return(
        <div id='left-elements-wrapper' className='float-left'>
			<div> <PawnTicketArt tokenId={ticketInfo.ticketNumber} />	</div>
            { account == null || ticketInfo.closed ? '' : <RepayCard account={account} ticketInfo={ticketInfo} repaySuccessCallback={refresh} /> }
            <TicketHistory ticketId={ticketInfo.ticketNumber}/>
        </div>
    )
}

function RightColumn({account, ticketInfo, refresh}: TicketPageBodyProps) {
    const [timestamp, setTimestamp] = useState(null)
    const [endSeconds, ] = useState(parseInt(ticketInfo.lastAccumulatedTimestamp.add(ticketInfo.durationSeconds).toString()))

    const refreshTimestamp = async () => {
        const height = await _provider.getBlockNumber()
        const block = await _provider.getBlock(height)
        setTimestamp(block.timestamp)
        console.log(`timestamp ${block.timestamp}`)
    }

    useEffect(() => {
        refreshTimestamp()
        const timeOutId = setInterval(() => refreshTimestamp(), 14000);
        return () => clearInterval(timeOutId);
      }, [ticketInfo]);

    return(
        <div id='right-elements-wrapper' className='float-left'>
            { ticketInfo.lastAccumulatedTimestamp.toString() == '0' ? '' : <div id='pawn-loan-art'> <PawnLoanArt tokenId={ticketInfo.ticketNumber} />	</div> } 
            { account == null || ticketInfo.closed ? '' :
            <div>
                <UnderwriteCard account={account} ticketInfo={ticketInfo} loanUpdatedCallback={refresh}/>
                { ticketInfo.loanOwner != account || timestamp == null || timestamp <  endSeconds ? '' : <SeizeCollateralCard account={account} ticketInfo={ticketInfo} seizeCollateralSuccessCallback={refresh} /> }
            </div>
            }
        </div>
    )
}

