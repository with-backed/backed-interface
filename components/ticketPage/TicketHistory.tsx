import { ethers } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
import { pawnShopContract } from "../../lib/contracts";

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function TicketHistory({ticketId}) {
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
            {history == null ? '' : history.map((e: ethers.Event, i) => <EventText event={e} key={i}/> )}
        </fieldset>
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