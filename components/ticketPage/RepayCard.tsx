import { ethers } from "ethers";
import { useState } from "react";
import { TicketInfo } from "../../lib/TicketInfoType";
import { web3PawnShopContract, pawnShopContract } from '../../lib/contracts'

interface RepayCardProps {
    account: string, 
    ticketInfo: TicketInfo,
    repaySuccessCallback: () => void
}

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function RepayCard({account, ticketInfo, repaySuccessCallback} : RepayCardProps) {
    const [txHash, setTxHash] = useState('')
    const [waitingForTx, setWaitingForTx] = useState(false)
    const [web3PawnShop, ] = useState(web3PawnShopContract)
    const [jsonRpcPawnShop, ] = useState(pawnShopContract(jsonRpcProvider))

    const repay = async () => {
        setTxHash('')
        setWaitingForTx(false)
        const t = await web3PawnShop.repayAndCloseTicket(ethers.BigNumber.from(ticketInfo.ticketNumber))
        t.wait().then((receipt) => {
            setTxHash(t.hash)
            setWaitingForTx(true)
            wait()
        })
        .catch(err => {
            setWaitingForTx(false)
            console.log(err)
        })
    }

    const wait = async () => {
        const filter = jsonRpcPawnShop.filters.Repay(ticketInfo.ticketNumber, null, null)
        jsonRpcPawnShop.once(filter, () => {
            repaySuccessCallback()
            setWaitingForTx(false)
        })
    }

    return(
        <fieldset className='standard-fieldset'>
            <legend>repay</legend>
            <p> The current cost to repay this loan    
                is {ethers.utils.formatUnits(ticketInfo.interestOwed.add(ticketInfo.loanAmount).toString(), ticketInfo.loanAssetDecimals)} {ticketInfo.loanAssetSymbol}.
                On repayment, the NFT collateral will be sent to the Pawn Ticket holder, {ticketInfo.ticketOwner.slice(0, 10)}...{ticketInfo.ticketOwner.slice(34, 42)}
            </p>
            <div className="button-1" onClick={repay} > Repay </div>
        </fieldset>
    )
}