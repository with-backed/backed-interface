import { useState } from "react"
import { ethers } from "ethers"
import TransactionButton from "../TransactionButton"

export default function AllowButton({jsonRpcContract, web3Contract, account, loanAssetSymbol, callback}){
    const [txHash, setTxHash] = useState(false)
    const [waitingForTx, setWaitingForTx] = useState(false)
    

    const allow = async () => {
        console.log(ethers.BigNumber.from(2).pow(256).sub(1))
        const t = await web3Contract.approve(process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT, ethers.BigNumber.from(2).pow(256).sub(1))
        setWaitingForTx(true)
        setTxHash(t.hash)
        t.wait().then((receipt) => {
            setWaitingForTx(true)
            waitForApproval()
        })
        .catch(err => {
            setWaitingForTx(false)
            console.log(err)
        })
    }

    const waitForApproval = async () => {
        const filter = jsonRpcContract.filters.Approval(account, process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT, null)
        jsonRpcContract.once(filter, (owner, spender, amount) => {
            callback()
            setWaitingForTx(false)
        })
    }

    return(
        <div id='allowance-button-wrapper'>
            <TransactionButton text={`allow pawn shop to move your ${loanAssetSymbol}`} onClick={allow} txHash={txHash} isPending={waitingForTx} />
        </div>
    )

}