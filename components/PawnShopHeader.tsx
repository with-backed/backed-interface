import Link from 'next/link'
import dynamic from 'next/dynamic'
const ConnectWallet = dynamic(
    () => import('./ConnectWallet'),
    { ssr: false }
  ) 


export default function PawnShopHeader({account, setAccount, message}) {

	return(
		<div id="pawnShopHeader">
            <Link href="/" >  
			<div id='gallery-button' className='float-left button-2'>
            ← gallery 
			</div>
            </Link>
            
			<h1>💸✨🎸 nft pawn shop 💍✨💸</h1>
			<div id="header-connect-address-wrapper">
				<ConnectWallet account={account} addressSetCallback={setAccount}  buttonType={2} />
			</div>
			<div id="pawnShopHeaderDivider">
				<h2> {message} </h2>
			</div>
		</div>
	)
}