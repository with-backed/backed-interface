export default function TransactionButton({text, onClick, txHash, isPending}){

    const handleClick = () => {
        if(txHash != ''){
            return
        }
        onClick()
    } 

    return(
        <div className={txHash == '' ? 'button-1' : 'clicked-button'} onClick={handleClick} >
            <p> <b> {text} </b></p>
            {txHash == '' ? '' :
            <p> {isPending ? "Pending..." : ""} <a href={process.env.NEXT_PUBLIC_ETHERSCAN_URL + "/tx/" +  txHash} target="_blank"> view transaction </a> </p>
            }
        </div>

    )
}