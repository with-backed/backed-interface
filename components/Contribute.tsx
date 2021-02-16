import React, { useEffect, useState } from 'react';

import { Button, Modal, Header, Icon, Input, Step, Segment, Loader, Dimmer, Image, Table, Popup } from 'semantic-ui-react'
import { ethers, BigNumber } from "ethers";
import TokenArtifact from "../contracts/Token.json";
import CommuneArtifact from "../contracts/Commune.json";

export default function Conbtribute({memberCount, communeContract, didContribute, communeID, account, assetAddress, assetSymbol}){

	const [open, setOpen] = React.useState(false)
	const [approved, setApproved] = React.useState(false)
	const [tokenContract, setTokenContract] = React.useState(null)
	const [assetDecimals, setAssetDecimals] = React.useState(18)
	// const [communeContract, setCommuneContract] = React.useState(null)

  var contribute = async (amount) => {
    communeContract.contribute(BigInt(amount), 1)
  }

  const checkApproval = async (assetContract) => {
  	if(account == null || assetContract == null){
  		console.log("is null")
  		return
  	}
  	const filter = await assetContract.filters.Approval(account, communeContract.address)

  	const results = await assetContract.queryFilter(filter)
  	setApproved(results.length > 0)
  }

  const getDecimals = async () => {
  	const decimals = await tokenContract.decimals()
		setAssetDecimals(decimals.toNumber())
  }

  const setup = async () => {
  	if(communeContract == null){
  		return
  	}
  	const provider = new ethers.providers.Web3Provider(window.ethereum)
  	if(tokenContract == null){
	  	const assetContract = new ethers.Contract(
	      assetAddress,
	      TokenArtifact.abi,
	       provider.getSigner(0)
	    );
	    setTokenContract(assetContract)
	    checkApproval(assetContract)
		} else {
			checkApproval(tokenContract)
		}
	// const communeContract = new ethers.Contract(
 //    "0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926",
 //    CommuneArtifact.abi,
 //     provider.getSigner(0)
 //  );
 //  setCommuneContract(communeContract)

  	
  }

  useEffect(() => {
  	setup()

  	}, [account])

  

  return(
  	<Modal
      closeIcon
      open={open}
      trigger={
      	<Button disabled={memberCount == 0} color="blue" > 
      		Contribute 
      	</Button>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Header>
      <Icon name='money' /> Contribute {assetSymbol} to commune #{communeID}
      </Header>
      <Modal.Content>
      <ContributeModalContent memberCount={memberCount} didContribute={didContribute} communeID={communeID} hasApproved={approved} assetDecimals={assetDecimals}
      assetSymbol={assetSymbol} setApproved={setApproved} 
      tokenContract={tokenContract} communeContract={communeContract}
      account={account}/>
		  
		
      </Modal.Content>
   
    </Modal>
    
    )
}

function ContributeModalContent({memberCount, didContribute, communeID, hasApproved, assetDecimals, assetSymbol, setApproved, tokenContract, communeContract, account}) {
	const [isLoading, setIsLoading] = React.useState(false)
	const [hasInput, setHasInput] = React.useState(false)
	const [hasConfirmed, setHasConfirmed] = React.useState(false)
	const [amount, setAmount] = React.useState(0)

	return(
		<div>
		<div>
		  <Step.Group ordered>
    <Step completed={hasApproved} active={!hasApproved}>
      <Step.Content>
        <Step.Title>Approve</Step.Title>
        
      </Step.Content>
    </Step>

    <Step active={hasApproved && !hasInput} completed={hasInput} >
      <Step.Content>
        <Step.Title>Input Amount</Step.Title>
        
      </Step.Content>
    </Step>

    <Step active={hasInput} completed={hasConfirmed} >
      <Step.Content>
        <Step.Title>Confirm</Step.Title>
      </Step.Content>
    </Step>
  </Step.Group>
  </div>
  
 	<Segment>
{isLoading ? 
	<div>
 		<Dimmer active inverted>
	    <Loader inverted content='Waiting for transaction to process' />
	  </Dimmer>

	  <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
	  </div>
	  :
<div>
  {!hasApproved  ?
  	<ApproveContent account={account} assetSymbol={assetSymbol} setApproved={setApproved} tokenContract={tokenContract} communeAddress={communeContract.address} setIsLoading={setIsLoading}/> : ""
  }

  {hasApproved && !hasInput ? 
  	<InputContribution tokenContract={tokenContract} account={account} 
  	assetDecimals={assetDecimals} assetSymbol={assetSymbol} amount={amount} setAmount={setAmount} setHasInput={setHasInput}/> : ""
  }

  {hasInput ? 
  	<ConfirmContent members={memberCount} didContribute={didContribute} account={account} communeID={communeID} communeContract={communeContract} amount={amount} assetDecimals={assetDecimals} assetSymbol={assetSymbol} hasConfirmed={hasConfirmed} setHasConfirmed={setHasConfirmed} setIsLoading={setIsLoading}/>
  	: ""

  }
  </div>
  
}
  </Segment>


  </div>
		)
  
}

function ApproveContent({account,  assetSymbol, setApproved, tokenContract, communeAddress, setIsLoading}){

	var approve = async () => {
	    if(tokenContract == null){
	      console.log("is null")
	      return
	    }
      setIsLoading(true)
	    const t = await tokenContract.approve(communeAddress, BigNumber.from(2).pow(255))
      t.wait().then((receipt) => {
         setIsLoading(false)
         setApproved(true)
      })
	    .catch(err => {
	    	console.log(err)
	    })
	}

	var waitForApproval = () => {
		
		const filter = tokenContract.filters.Approval(account, communeAddress)

		tokenContract.once(filter, (from, to, value) => {
     		setIsLoading(false)
     		setApproved(true)
    	})
	}


	return(
		<div>
			<p> You need to approve the Commune Contract to spend your {assetSymbol} </p>
			<Button onClick={approve}> Approve </Button>
		</div>
		
		)

}

function ConfirmContent({members, didContribute, account, communeID, communeContract, amount, assetDecimals, assetSymbol, setIsLoading, hasConfirmed, setHasConfirmed}) {
	const [fee, setFee] = React.useState(0)
	// const [members, setMembers] = React.useState(0)


	const getFee = async () => {
		const feeRate = await communeContract.feeRate()
		const feeAmount = (amount * feeRate.toNumber()) / 10000
		setFee(feeAmount)
	}

	var contribute = async () => {
      setIsLoading(true)
	    const t = await communeContract.contribute(ethers.utils.parseUnits(amount, assetDecimals), communeID)
	    t.wait().then((receipt) => {
	       setIsLoading(false)
         setHasConfirmed(true)
         didContribute()
	    })
	    .catch(err => {
        setIsLoading(false)
	    	console.log(err)
	    })
	}

	var waitForContribution = () => {		
		const filter = communeContract.filters.Contribute(account, BigNumber.from(communeID))

		communeContract.once(filter, (account, commune, amount) => {
     		setIsLoading(false)
     		setHasConfirmed(true)
     		didContribute()
    	})
	}

	React.useEffect(() => {
		// getMembers()
		getFee()
	})


	return(
		<div>
		{ hasConfirmed ? 
			<div>
			<p> All set! Thanks for your contribution! </p>
			</div>
			:

		<div>
		<Table basic='very' celled collapsing>
      <Table.Row> 
      <Table.Cell> Amount </Table.Cell>
      <Table.Cell> {amount} {assetSymbol} </Table.Cell>
      </Table.Row> 
      <Table.Row> 
      <Table.Cell> 
      	<div> Fee 
      		<Popup  className='float-left' content='Fee supports ongoing development of Commune' trigger={<Icon id="prorated-explainer" size="small" circular name='question' />} /> 
      	</div>
 			</Table.Cell> 
      <Table.Cell>  {fee}  {assetSymbol} </Table.Cell>
      </Table.Row> 
       <Table.Row> 
      <Table.Cell> Members </Table.Cell>
      <Table.Cell>  {members} </Table.Cell>
      </Table.Row> 
       <Table.Row> 
      <Table.Cell> Final amount to each member </Table.Cell>
      <Table.Cell>  {(amount - fee)/members} {assetSymbol} </Table.Cell>
      </Table.Row> 
    </Table>
    <Button onClick={contribute} color="blue"> Submit </Button>
    </div>
  }
  </div>
		)
}

function InputContribution({account, tokenContract, assetDecimals, assetSymbol, amount, setAmount, setHasInput}){
	const [balance, setBalance] = useState("0")

	const handleKeyPress = (event) => {
	  if(event.key === 'Enter'){
	    console.log('enter press here! ')
	  }
	}

	const handleChange = (event) => {
		setAmount(event.target.value)
  }

  const getBalance = async () => {
  	const balance = await tokenContract.balanceOf(account)
    setBalance(ethers.utils.formatUnits(balance, assetDecimals))
  	// setBalance(balance.toString() / Math.pow(10, assetDecimals))
  }

  useEffect(() => {
  	getBalance()
  })

	return(
		<div>
		<p> You have {balance} {assetSymbol}</p>
		<Input error={parseFloat(amount) > parseFloat(balance) || parseFloat(amount) < 0} placeholder='Amount to contribute' onKeyPress={handleKeyPress} type='number' value={amount} onChange={handleChange}/>
		<Button onClick={() => setHasInput(true)} color="blue" disabled={parseFloat(amount) == 0 || parseFloat(amount) > parseFloat(balance)}> continue </Button>
		{parseFloat(amount) > parseFloat(balance) ? 
			<p> exceeds amount available </p>
			: ""}
			{parseFloat(amount) < 0 ? 
			<p> cannot contribute a negative amount </p>
			: ""}
		</div>
		)

}
