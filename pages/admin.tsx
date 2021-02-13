import Head from 'next/head'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import ConnectWallet from '../components/ConnectWallet'
import React, { useState } from 'react';
import { ethers } from "ethers";
import { Button } from 'semantic-ui-react'


export default function Home(){
  const [signer, setSigner] = React.useState(null)
  const [communeContract, setCommuneContract] = React.useState(null)
  const [tokenContract, setTokenContract] = React.useState(null)

  return (
   <div>
      <Head>
        <title>Admin</title>
      </Head>
      <div>
      
      </div>
      { communeContract == null || tokenContract == null ?
      <ConnectWallet setCommuneContract={setCommuneContract}  setTokenContract={setTokenContract} />
      : 
      <div>
      <Allow communeAddress={communeContract.address} tokenContract={tokenContract} /> 
      <GetApproval communeAddress={communeContract.address} tokenContract={tokenContract} /> 
      <SetAssetStatus tokenAddress={tokenContract.address} communeContract={communeContract} />
      <CreateCommune tokenAddress={tokenContract.address} communeContract={communeContract} />
      <JoinCommune communeContract={communeContract} />
      <Contribute communeContract={communeContract} />
      <Balance communeContract={communeContract} />
      <AddCommuneMember communeContract={communeContract} />
      <CommuneController communeContract={communeContract} />
      <Withdraw communeContract={communeContract} />
      <SetTreasuryAddress communeContract={communeContract} />
      <GetCommune communeContract={communeContract} />
      </div>
    }
      <NumberOfCommunes communeContract={communeContract}/>


   </div>
      
  )
}

function GetApproval({communeAddress, tokenContract}) {
  var get = async () => {
    console.log(communeAddress)
    // console.log(tokenContract.abi)
    // let iface = new ethers.utils.Interface(tokenContract.abi);
    // const logs = await tokenContract.filters.Approval(null, communeAddress)
    // console.log(logs)
    

    let filter = tokenContract.filters.Transfer(null, "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f");
    const values = []
    // console.log(filter)
    tokenContract.on(filter, (from, to, value) => {
    console.log('I received ' + value.toString() + ' tokens from ' + from);
    values.push(value.toString())
  });
    console.log(values)


    // console.log(tokenContract.interface.parseLog(logs))
    // let events = logs.map((log) => tokenContract.interfaace.parseLog(log))

    
  }

  return(
    <div onClick={get}>
    get approvals
    </div>
    )
}

function Withdraw({communeContract}){
  var withdraw = async () => {
    communeContract.withdraw("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 1, BigInt(Math.pow(10, 17)))
  }

  return(
    <div onClick={withdraw}>
     Withdraw
    </div>
    )
}

function GetCommune({communeContract}){
  var get = async () => {
    const commune = await communeContract.getCommune(BigInt(1))
    console.log(commune)
  }

  return(
    <div onClick={get}>
     Get Commune
    </div>
    )
}

function SetTreasuryAddress({communeContract}){
  var withdraw = async () => {
    communeContract.setTreasuryAddress("0x5409ED021D9299bf6814279A6A1411A7e866A631")
  }

  return(
    <div onClick={withdraw}>
     Set Treasury Address
    </div>
    )
}

function AddCommuneMember({communeContract}){
  var addMember = async () => {
    communeContract.addCommuneMember("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 1)
  }

  return(
    <div>
    <Button primary onClick={addMember}>
     Add Commune Member
    </Button>
    </div>
    )
}

function Balance({communeContract}){
  var getBalance = async () => {
    const balance = await communeContract.balanceOf("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 1)
    console.log(balance.toString())
  }

  return(
    <div onClick={getBalance}>
     Get Balance
    </div>
    )
}


function Contribute({communeContract}){
  var contribute = async () => {
    communeContract.contribute(BigInt(Math.pow(10,18)), 1)
  }

  return(
    <div onClick={contribute}>
     Contribute
    </div>
    )
}

function JoinCommune({communeContract}){
  var join = async () => {
    communeContract.joinCommune(1)
  }

  return(
    <div onClick={join}>
     Join Commune
    </div>
    )
}

function CreateCommune({tokenAddress, communeContract}){
  var createCommune = async () => {
    const t = await communeContract.createCommune("", "0x8464135c8F25Da09e49BC8782676a84730C318bC", false, true, true)
    t.wait().then((receipt) => {
      console.log(receipt.events[0].args.commune.toString())
      console.log(receipt)
    })
    // console.log(n)
    // console.log("commune number " + n.value.toNumber())
  }

  return(
    <div onClick={createCommune}>
      {communeContract.address}    
     createCommune
    </div>
    )
}

function SetAssetStatus({tokenAddress, communeContract}){
  var setStatus = async () => {
    communeContract.setAssetStatus(tokenAddress, true)
  }

  return(
    <div onClick={setStatus}>
     Set Asset Status
    </div>
    )
}

function Allow({communeAddress, tokenContract}){

  var allow = async () => {
    if(tokenContract == null){
      console.log("is null")
      return
    }
    console.log("commune address")
    console.log(communeAddress)
    tokenContract.approve(communeAddress, BigInt(Math.pow(10,19))).then((receipt) => {
      console.log("receipt")
      console.log(receipt)
    })

    // const filter = await tokenContract.filters.Approval("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1")
    // tokenContract.once(filter, (from, to, value) => {
    //   console.log("we got the once!")
    //   console.log(from)
    //   console.log(to)
    //   console.log(value.toString())
    // })
    // 0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f
    // await tokenContract.transfer("0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f", BigInt(Math.pow(10,18)))
    // console.log("number")
    // console.log(number)
  }
  return(
    <div onClick={allow}>
     allow
    </div>
    )
}

function NumberOfCommunes({communeContract}){

  var getNumberOfCommunes = async () => {
    if(communeContract == null){
      console.log("is null")
      return
    }
    const number = await communeContract.numberOfCommunes()
    console.log("number")
    console.log(number.toString())
  }
  return(
    <div onClick={getNumberOfCommunes}>
     Get Number
    </div>
    )
}

function CommuneController({communeContract}){

  var getCommuneController = async () => {
    if(communeContract == null){
      console.log("is null")
      return
    }
    const controller = await communeContract.communeController(BigInt(1))
    console.log("controller")
    console.log(controller)
  }
  return(
    <div onClick={getCommuneController}>
     Get Controller
    </div>
    )
}

