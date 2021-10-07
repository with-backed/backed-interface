import { ethers } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
import { pawnShopContract } from "../../lib/contracts";
import { formattedAnnualRate } from "../../lib/interest";
import { secondsToDays } from '../../lib/duration';

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function TicketHistory({ticketId, loanAssetDecimals}) {
    const [history, setHistory] = useState(null)

    const setup = async () => {
        const history = await getTicketHistory(ticketId)
        console.log('0000')
        console.log(history)
        setHistory(history)
    }

    useEffect(() => {
        setup()
    }, [])

    return(
        <fieldset className='standard-fieldset'>
            <legend> activity </legend>
            {history == null ? '' : history.map((e: ethers.Event, i) =>  <ParsedEvent event={e} loanAssetDecimals={loanAssetDecimals} key={i}/> )}
        </fieldset>
    )
}

interface ParsedEventProps {
    event: ethers.Event,
    loanAssetDecimals: ethers.BigNumber,
}

function ParsedEvent({event, loanAssetDecimals}) {
    console.log(event)
    switch (event.event) {
        case "MintTicket":
            return MintEventDetails(event, loanAssetDecimals)
            break;
        case "UnderwriteLoan":
            return UnderwriteEventDetails(event, loanAssetDecimals)
            break;
    }
    return (
        <EventText event={event} />
    )
}

function MintEventDetails(event: ethers.Event, loanAssetDecimals: ethers.BigNumber){
    const [minter, ]  = useState(event.args['minter'])
    const [maxInterestRate, ]  = useState(formattedAnnualRate(event.args['maxInterestRate']))
    const [minLoanAmount, ]  = useState(ethers.utils.formatUnits(event.args['minLoanAmount'], loanAssetDecimals))
    const [minDuration, ]  = useState(secondsToDays(event.args['minDurationSeconds']))
    const [timestamp, setTimestamp] = useState(0)

    const getTimeStamp = async () => {
        const t = await event.getBlock()
        setTimestamp(t.timestamp)
    }

    useEffect(()=> {
        getTimeStamp()
    })

    return(
        <div className='event-details'>
            <p> <b> Mint Ticket </b> - {toDateTime(timestamp).toLocaleDateString()} {toDateTime(timestamp).toLocaleTimeString()} </p>
            <p> minter: <a target="_blank" href={process.env.NEXT_PUBLIC_ETHERSCAN_URL + "/address/" +  minter }>  {minter.slice(0,10)}... </a></p>
            <p> max interest rate: {maxInterestRate}%</p>
            <p> minimum loan amount: {minLoanAmount}</p>
            <p> minimum duration: {minDuration}</p>
        </div>
    )
}

function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}

function UnderwriteEventDetails(event: ethers.Event, loanAssetDecimals: ethers.BigNumber){
    const [underwriter, ]  = useState(event.args['underwriter'])
    const [interestRate, ]  = useState(formattedAnnualRate(event.args['interestRate']))
    const [loanAmount, ]  = useState(ethers.utils.formatUnits(event.args['loanAmount'], loanAssetDecimals))
    const [duration, ]  = useState(secondsToDays(event.args['durationSeconds']))
    const [timestamp, setTimestamp] = useState(0)

    const getTimeStamp = async () => {
        const t = await event.getBlock()
        setTimestamp(t.timestamp)
    }

    useEffect(()=> {
        getTimeStamp()
    })

    return(
        <div className='event-details'>
            <p> <b> Underwrite Loan </b> - {toDateTime(timestamp).toLocaleDateString()} {toDateTime(timestamp).toLocaleTimeString()} </p>
            <p> underwriter: <a target="_blank" href={process.env.NEXT_PUBLIC_ETHERSCAN_URL + "/address/" +  underwriter }>  {underwriter.slice(0,10)}... </a></p>
            <p> interest rate: {interestRate}%</p>
            <p> loan amount: {loanAmount}</p>
            <p> duration: {duration}</p>
        </div>
    )
}

interface EventTextProps {
    event: ethers.Event
}

function EventText({event} : EventTextProps) {
    const [argValues, setArgValues] = useState([]) 
    

    useEffect(() => {
        var argValues = Object.keys(event.args).map((k : string) => {
            if (parseInt(k) + '' == k || k == 'id') {
                return null
            }
            var value = event.args[k]
            if (value instanceof ethers.BigNumber){
                value = value.toString()
            }
            value = value + ''
            if(value.length > 10){
                value = value.slice(0,10) + '...'
            }

            return {arg: k, value: value}
        })
        argValues = argValues.filter((a) => a != null)

        console.log(argValues)
        setArgValues(argValues)
    }, [])

    return(
        <div className='display-table'>
            <p><b>{event.event}</b> - block #{event.blockNumber}</p>
            {argValues.map((k, i) => <ArgValueProps arg={k.arg} value={k.value} key={i} />) }
            <br/>
        </div>
    )
}

interface ArgValueProps {
    arg: string, 
    value: any
}

function ArgValueProps({arg, value}: ArgValueProps){
    return(
        <div className='display-table'>
            <p className='float-left'>{arg}: {value}</p>
        </div>
    )
}

const getTicketHistory = async (ticketId) => {
    const contract = pawnShopContract(jsonRpcProvider)

    const mintTicketFilter = contract.filters.MintTicket(ethers.BigNumber.from(ticketId), null)
    const closeFilter = contract.filters.Close(ethers.BigNumber.from(ticketId))
    const underwriteFilter = contract.filters.UnderwriteLoan(ethers.BigNumber.from(ticketId), null)
    const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(ethers.BigNumber.from(ticketId), null, null)
    const repayAndCloseFilter = contract.filters.Repay(ethers.BigNumber.from(ticketId), null, null)
    const seizeCollateralFilter = contract.filters.SeizeCollateral(ethers.BigNumber.from(ticketId))

    const filters = [mintTicketFilter, closeFilter, underwriteFilter, buyoutUnderwriteFilter, repayAndCloseFilter, seizeCollateralFilter]

    var allEvents = []
    for(var i = 0; i < filters.length; i++){
        let results = await contract.queryFilter(filters[i])
        allEvents = allEvents.concat(results)
    }
    allEvents.sort((a,b) => {
        return b.blockNumber - a.blockNumber
    })
    
    return allEvents
}

