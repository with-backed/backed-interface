import React, { useEffect, useState } from 'react';
import { CommuneData } from "../lib/CommuneData"
import CommuneArtifact from "../contracts/Commune.json";
import { ethers } from "ethers";
import { Message, Button, Label, Container } from 'semantic-ui-react'
import CommunePage from '../components/CommunePage'

export default function Commune(communeData: CommuneData) {
  const [communeContract, setCommuneContract] = React.useState(null)
  const [providerAvailable, setProviderAvailable] = React.useState(false)
  const [account, setAccount] = React.useState(null)

  useEffect(() => {
    setup()
  }, [])

  const setup = async () => {
    if(window.ethereum == null){
      setProviderAvailable(false)
      return
    }
    setProviderAvailable(true)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setCommuneContract(createCommuneContract(provider))
  }

  const createCommuneContract = (provider) => {
     return new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      provider.getSigner(0)
    );
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

  const isMetaMaskConnected = async (provider) => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  }

  

return(
  <div>
  <Container>
  <br/>
  <div className="warning-header">
   <Message negative >
    <Message.Header>Warning!</Message.Header>
    <p>Commune is alpha version software that is still in development. Use at your own risk!</p>
  </Message>
  </div>
  </Container>
  <br/>
  <Container >

  {providerAvailable ? 
    <div>
      {account == null ? 
        <Button floated="right" onClick={getAccount}> Connect Wallet </Button>:
        <div id="address">
        <Label  content={"Account"} detail={ account }/>
        </div>
      }
    </div>
  : 
    <div>
    <Message warning> If you want to connect, please use the <a href="https://www.google.com/chrome/"> Chrome web broswer </a> and the <a href="https://metamask.io/"> MetaMask extension </a> </Message>
    <br/>
    </div>
  }
<style jsx>{`
       #address {
         float: right;
       }

      `}</style>
</Container>

  <CommunePage account={account} communeContract={communeContract} communeData={communeData}/>
  </div>


  )
}