import React, { useEffect, useState } from 'react';
import { Message, Header, Container, Button, Checkbox, Form, Label, Dimmer, Loader } from 'semantic-ui-react'

import CommuneArtifact from "../contracts/Commune.json";
import TokenArtifact from "../contracts/Token.json";
import { ethers } from "ethers";

export default function Create() {
	const [allowJoining, setAllowJoining] = useState(false)
	const [allowRemoving, setAllowRemoving] = useState(false)
	const [allowOutsideContribution, setAllowOutsideContribution] = useState(false)
	const [communeContract, setCommuneContract] = useState(null)
	const [providerAvailable, setProviderAvailable] = useState(false)
	const [account, setAccount] = useState(null)
	const [asset, setAsset] = useState("")
	const [isBadAddress, setIsBadAddress] = useState(false)
	const [isNotERC20, setIsNotERC20] = useState(false)
	const [provider, setProvider] = useState(null)
	const [isLoading, setIsLoading] = useState(false)

	const toggleJoining = () => {
		if(allowRemoving){
			return
		}
		setAllowJoining(!allowJoining)
	}

	const toggleRemoving = () => {
		if(allowJoining){
			return
		}
		setAllowRemoving(!allowRemoving)
	}

	const setup = async () => {
    if(window.ethereum == null){
      setProviderAvailable(false)
      return
    }
    setProviderAvailable(true)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    setCommuneContract(createCommuneContract(provider))
  }

  const getAccount = async () => {
    const accounts = await window.ethereum.send('eth_requestAccounts');
    const account = accounts.result[0]
    setAccount(account)
    window.ethereum.on('accountsChanged', function (accounts) {
      console.log("accounts changed")
      setAccount(accounts[0])
    })
  }

  const checkERC20 = async () => {
  	const token = new ethers.Contract(
      asset,
      TokenArtifact.abi,
      provider
    );
    const symbol = await token.symbol().catch((error) => {

    })
    if(symbol != null){
    	return true
    } else {
    	return false
    }
  }

  var createCommune = async () => {
  	if(!ethers.utils.isAddress(asset)){
      setIsBadAddress(true)
      return
    }
    const isERC20 = await checkERC20()
    if(!isERC20){
    	setIsNotERC20(true)
    	return
    }

    setIsLoading(true)

    const t = await communeContract.createCommune("", asset, allowJoining, allowRemoving, allowOutsideContribution).catch((error) => {
    	setIsLoading(false)
    })
    if(t == null){
    	return
    }
    t.wait().then((receipt) => {
      const c = receipt.events[0].args.commune.toString()
      window.location.assign("/communes/" + c );
      setIsLoading(false)
    })

  }

  const handleChange = (event) => {
    setAsset(event.target.value)

  }

  useEffect(() => {
  	setup()
  }, [])

  const createCommuneContract = (provider) => {
     return new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      provider.getSigner(0)
    );
   }

   const clearErrors = () => {
   	setIsBadAddress(false)
   	setIsNotERC20(false)
   }


	return(
		<div>
		<Dimmer active={isLoading} inverted>
        <Loader inverted content='Waiting for transaction to process' />
      </Dimmer>
		{!providerAvailable ? 

			<Message warning> Sorry! Commune doesn't work in this broswer. 
			If you want to connect, please use the <a href="https://www.google.com/chrome/"> Chrome web broswer </a> and the <a href="https://metamask.io/"> MetaMask extension </a> 
			</Message> 
			:
		<Container>
		<br/>
		<Header> Create a Commune </Header>
		<Form>
			<Message>
		    <Form.Field>
		      <label>ERC20 Asset Contract Address</label>
		      <p> This is the asset that will be contributed to the Commune, 
		      and then which will be distributed to Commune members. Any ERC20 allowed.
		      </p>
		      <input onFocus={clearErrors} onChange={handleChange} placeholder='ERC20 Asset Contract Address' />
		      
		      <div>
		      {isNotERC20 || isBadAddress ? 
		      	<div>
		      <br/>
		      
		      {isNotERC20 ? <Label color="red"> Address is not ERC20 contract </Label> : ""}
		      {isBadAddress ? <Label color="red"> Invalid address </Label> : ""}
		      </div>
		      : "" }
		      </div>
		    </Form.Field>
		    </Message>
		    <Header> Settings </Header>
		    <p> Note: Commune cannot both allow joining and controller removing </p>
		    <Form.Field>
		      <Checkbox label='Allows outsiders to join' disabled={allowRemoving} checked={allowJoining} onClick={toggleJoining}/>
		     </Form.Field>	
		     <Form.Field>
		      <Checkbox label='Allows controller to remove members' disabled={allowJoining} onClick={toggleRemoving} />
		      </Form.Field>
		      <Form.Field>
		      <Checkbox label='Allows outsiders to contribute to the commune' onClick={ () => setAllowOutsideContribution(!allowOutsideContribution)}/>
		      </Form.Field>
		     
		    {account == null ? 
		    	<Button onClick={getAccount} > Connect Wallet </Button>
		    	: 
		    	<Button color="blue" onClick={createCommune}>Submit</Button>
		    }
		    
	 	</Form>
	 	</Container>
	 }
	 </div>
		)
}

