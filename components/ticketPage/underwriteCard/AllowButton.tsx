import { useState } from "react"
import { ethers } from "ethers"

export default function AllowButton({jsonRpcContract, web3Contract, account, loanAssetSymbol, callback}){
    const [waitingForTx, setWaitingForTx] = useState(false)
    

    const allow = async () => {
        console.log(ethers.BigNumber.from(2).pow(256).sub(1))
        const t = await web3Contract.approve(process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT, ethers.BigNumber.from(2).pow(256).sub(1))
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
        <div id='allowance-button' onClick={allow} className={`float-left button-1 ${waitingForTx ? 'disabled-button' : ''}`}> allow pawn shop to move your {loanAssetSymbol} </div>
        {waitingForTx ? <div className="float-left blue-loader"></div> : '' }
        </div>
    )

}