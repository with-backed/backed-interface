export default function TransactionButton({text, onClick, txHash, isPending, disabled = false}){

    const handleClick = () => {
        if(txHash != '' || disabled){
            return
        }
        onClick()
    } 

    return(
        <div className={txHash == '' ? `button-1 ${disabled ? 'disabled-button' : ''}` : 'clicked-button'} onClick={handleClick} >
            <p> {text} </p>
            {txHash == '' ? '' :
            <p className='times'> {isPending ? "Pending..." : ""} <a href={process.env.NEXT_PUBLIC_ETHERSCAN_URL + "/tx/" +  txHash} target="_blank"> view transaction </a> </p>
            }
        </div>

    )
}