
export default function Explainer({account}) {
    return(
        <div  id='create-ticket-explainer'>
            <p> Mint your pawn ticket! This transaction will (1) transfer your NFT to the pawn shop, (2) set your minimum loan terms to offer to underwriters,
                and (3) transfer to you a pawn ticket NFT. 
            </p>
            <p>
                If someone accepts your terms, underwriting the loan, the loan amount will be transfered to your address, 
                less a 1% origination fee. 
            </p>
            <p>
                Before the loan is underwritten, you can close your ticket and receive your collateral back at any time.
            </p>
            <p>
                After the loan is underwritten, your are obligated to pay back the full loan amount 
                + interest in order to receive your collateral back. If you do not pay the loan back by the end of the loan term,
                the underwriter can seize your collateral. 
            </p>
        </div>
    )
}