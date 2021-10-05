import { ethers } from "ethers";
import { useState } from "react";
import { TicketInfo } from "../../lib/TicketInfoType";
import { web3PawnShopContract, pawnShopContract } from '../../lib/contracts'

interface SeizeCollateralCardProps {
    account: string, 
    ticketInfo: TicketInfo,
    seizeCollateralSuccessCallback: () => void
}

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function SeizeCollateralCard({account, ticketInfo, seizeCollateralSuccessCallback} : SeizeCollateralCardProps) {
    const [amountOwed, ] = useState(ethers.utils.formatUnits(ticketInfo.interestOwed.add(ticketInfo.loanAmount).toString(), ticketInfo.loanAssetDecimals))
    const [txHash, setTxHash] = useState('')
    const [waitingForTx, setWaitingForTx] = useState(false)
    const [web3PawnShop, ] = useState(web3PawnShopContract)
    const [jsonRpcPawnShop, ] = useState(pawnShopContract(jsonRpcProvider))

    const repay = async () => {
        setTxHash('')
        setWaitingForTx(false)
        const t = await web3PawnShop.seizeCollateral(ethers.BigNumber.from(ticketInfo.ticketNumber), account)
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
        const filter = jsonRpcPawnShop.filters.SeizeCollateral(ethers.BigNumber.from(ticketInfo.ticketNumber))
        jsonRpcPawnShop.once(filter, () => {
            seizeCollateralSuccessCallback()
            setWaitingForTx(false)
        })
    }

    return(
        <fieldset className='standard-fieldset'>
            <legend>seize collateral</legend>
            <p> 
            The loan duration is complete. 
            The total interest and principal owed is {amountOwed} {ticketInfo.loanAssetSymbol}, 
            and 0 {ticketInfo.loanAssetSymbol} has been repaid. You are able to seize the collateral NFT, closing the loan, or wait for repayment.
            </p>
            <div className="button-1" onClick={repay} > seize collateral </div>
        </fieldset>
    )
}