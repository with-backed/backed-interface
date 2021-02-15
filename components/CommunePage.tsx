import { ethers, BigNumber } from "ethers";
import React, { useEffect, useState } from 'react';
import Head from 'next/head'

import Contribute from "../components/Contribute"
import { Container, Header, Divider, Label, Grid, Button, Message, Popup, Icon, Loader, Dimmer, Modal } from 'semantic-ui-react'

import CommuneArtifact from "../contracts/Commune.json";
import TokenArtifact from "../contracts/Token.json";

import { CommuneData } from "../lib/CommuneData"
import CommuneDetailsTable from "./communePage/CommuneDetailsTable"
import JoinButton from "./communePage/JoinButton"
import LeaveButton from "./communePage/LeaveButton"
import WithdrawButton from "./communePage/WithdrawButton"
import ContributionHistory from "./communePage/ContributionHistory"
import AddMemberButton from "./communePage/AddMemberButton"
import RemoveMemberButton from "./communePage/RemoveMemberButton"
import ChangeControllerButton from "./communePage/ChangeControllerButton"

export default function CommunePage({account, communeContract, communeData}) {
  // const [communeContract, setCommuneContract] = React.useState(null)
  const [isCommuneMember, setIsCommuneMember] = React.useState(false)
  const [addressBalance, setAddressBalance] = React.useState(0)
  const [proratedTotal, setProratedTotal] = React.useState(communeData.proratedTotal)
  const [memberCount, setMemberCount] = React.useState(communeData.memberCount)
  const [controller, setController] = React.useState(communeData.controller)
  const [isLoading, setIsLoading] = React.useState(false)



  useEffect(() => {
    get()
  })

  const didContribute = () => {
    console.log("called did contribute")
    getBalance()
    refreshData()
  }
   

  const get = async () => {
    // setCommuneContract(createCommuneContract())
    if(communeContract == null){
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    isMember()
    getBalance()
   

    const token = new ethers.Contract(
      communeData.asset,
      TokenArtifact.abi,
      provider.getSigner(0)
    );
   
  }

  const didJoin = () => {
    isMember()
    refreshData()
    // getMemberCount()
  }

  const isMember = async () => {
    if(communeContract == null || account == null){
      console.log("is null :( ")
      return
    }

    const isCommuneMember = await communeContract.isCommuneMember( BigInt(communeData.id),account)
    console.log("is member " + isCommuneMember)
    setIsCommuneMember(isCommuneMember)
    
  }

  const refreshData = async () => {
    const data = await communeContract.getCommune(BigInt(communeData.id))
    setMemberCount(data["memberCount"].toNumber())
    setProratedTotal(parseInt(data["proratedTotal"].toString()) / Math.pow(10, communeData.assetDecimals))
    setController(data["controller"])
  }

  const getBalance  = async () => {
     if(communeContract == null){
       console.log("is null in getBalance")
      return
    }
    if(account == null){
      return
    }
    const balance = await communeContract.balanceOf(account, BigInt(communeData.id))
    console.log("settting address balance")
    console.log(parseInt(balance.toString()) / Math.pow(10, communeData.assetDecimals))
    setAddressBalance(parseInt(balance.toString()) / Math.pow(10, communeData.assetDecimals))
  }

  // const getController  = async () => {
  //    if(communeContract == null){
  //     return
  //   }
  //   const controller = await communeContract.communeController(BigInt(communeData.id))
  //   setController(controller)
  // }

  // const getProratedTotal  = async () => {
  //    if(communeContract == null){
  //      console.log("is null in getProratedTotal")
  //     return
  //   }
  //   const total = await communeContract.communeProratedTotal(BigInt(communeData.id))
  //   setProratedTotal(parseInt(total.toString()) / Math.pow(10, communeData.assetDecimals))
  // }

  // const getMemberCount  = async () => {
  //    if(communeContract == null){
  //     return
  //   }
  //   const memberCount = await communeContract.communeMemberCount(BigInt(communeData.id))
  //   console.log("member count " + memberCount)
  //   setMemberCount(memberCount.toNumber())
  // }
 

  return (
    <Container>
    
      <Head>
        <title>Commune {communeData.id}</title>
      </Head>
      <Header as='h1' color='blue'> Commune #{communeData.id} </Header>
      <div>
      {account == null ? "" :
      <div>

        {
          isCommuneMember || addressBalance > 0 ? 
           
          <Header as='h1'> Your balance: {addressBalance} {communeData.assetSymbol} </Header>
          
          :
          <Label color='yellow'> You are not currently a member of this commune </Label>
        }
        </div>
      }
      </div>
      <br/>
      <div id="prorated-total-container" >
      <Header className='float-left' as='h3'> Prorated total: {proratedTotal} {communeData.assetSymbol}    
     

      </Header>
       <Popup  className='float-left' content='Prorated total is the theoretical total share of someone who has been a part of the commune since its creation and has
      not withdrawn anything' trigger={<Icon id="prorated-explainer" size="small" circular name='question' />} />

      </div>

      <style jsx>{`
       #prorated-total-container{
         display: inline-flex;
       }
       #prorated-explainer {
         margin-left: 10px;
       }
      `}</style>

      <Message>
        <CommuneDetailsTable communeData={communeData} memberCount={memberCount} controller={controller} />    
      </Message>  

      <Dimmer active={isLoading} inverted>
        <Loader inverted content='Waiting for transaction to process' />
      </Dimmer>


     
      {communeContract == null || account == null ? "" :
      <Grid>
        <Grid.Row>
        {communeData.allowsOutsideContribution ? 
          <div>
          <div> down for maintenance </div>
            
          </div>
        : "" }

        {communeData.allowsJoining && !isCommuneMember ? 
          <JoinButton communeContract={communeContract} communeID={communeData.id} 
          setIsLoading={setIsLoading} didJoin={didJoin} account={account}/>
         : ""
        }

        {isCommuneMember ? 
          <div>
        { addressBalance > 0 ? 
        <div> down for maintenance </div>
        : ""
      }
        <LeaveButton communeContract={communeContract} communeID={communeData.id} 
          setIsLoading={setIsLoading} didJoin={didJoin} account={account}/>
        </div>
        : ""
      }
        </Grid.Row>
        <Grid.Row> 
        { account != null && account.toLowerCase() == controller.toLowerCase() ?
        
          <AdminButtons communeContract={communeContract} communeData={communeData} setIsLoading={setIsLoading} memberChange={didJoin} getController={refreshData}/>
          : ""
        }
        </Grid.Row>  
      </Grid>
    }
      <br/>
      <ContributionHistory communeData={communeData} />

      <br/>
      
    </Container>
     
  )
}

// <Contribute memberCount={memberCount} communeContract={communeContract} didContribute={didContribute} communeID={communeData.id} account={account} assetAddress={communeData.asset} assetSymbol={communeData.assetSymbol}/>
            // {memberCount == 0 ? <p> Must have at least one member to accept contributions </p> : "" }
            // <WithdrawButton balance={addressBalance} communeContract={communeContract} communeID={communeData.id} 
          // setIsLoading={setIsLoading} didWithdraw={didContribute} account={account} assetDecimals={communeData.assetDecimals}/>

const AdminButtons = ({communeContract, communeData, setIsLoading, memberChange, getController}) => {
  return(
    <div>
    <Header as="h3"> Admin Controls </Header>
    <AddMemberButton communeContract={communeContract} communeID={communeData.id} setIsLoading={setIsLoading} didAddMember={memberChange}/>
    <RemoveMemberButton communeContract={communeContract} communeID={communeData.id} setIsLoading={setIsLoading} didRemoveMember={memberChange}/>
    <ChangeControllerButton communeContract={communeContract} communeID={communeData.id} setIsLoading={setIsLoading} didUpdateController={getController}/>
    </div>
    )
}
