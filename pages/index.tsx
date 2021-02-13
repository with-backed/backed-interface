import Head from 'next/head'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import ConnectWallet from '../components/ConnectWallet'
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Button, Header } from 'semantic-ui-react'
import CommuneArtifact from "../contracts/Commune.json";

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const communeContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      _provider
    );


export default function Home(){
  const [communes, setCommunes] = useState(0)

  const getNumberOfCommunes = async () => {
    const count = await communeContract.numberOfCommunes()
    setCommunes(count.toString())
  }

  useEffect(() => {
    getNumberOfCommunes()
  }, [])

  return (
   <div>
      <Head>
        <title>{"Commune"}</title>
        <link
 
  rel="stylesheet"
  href="//cdn.jsdelivr.net/npm/semantic-ui@${props.versions.sui}/dist/semantic.min.css"
/>
<script
  async
  src="//cdn.jsdelivr.net/npm/semantic-ui@${props.versions.sui}/dist/semantic.min.js"
></script>
      </Head>
      <div>
      <div id="left-bar">
      <div id="left-bar-content">
      <img id="logo" src="logo.svg" />
      <div id="text-box">
      Commune is an Ethereum-based app. 
      It provides a simple way to distribute ERC20 assets equally among a set of addresses: Contribute some amount of an asset to a commune, 
      and each member of the commune gets an equal share.  
      </div>
      <div id="commune-count"> 
      Current number of communes: {communes}
      </div>
      </div>
      </div>
      
      <div id="right-side">
        <div id="right-side-content">
        <Header as="h2"> Steps to using Commune </Header>
        <Header as="h4"> 1. <Link href="/create" > Create a Commune </Link> </Header>
        <Header as="h4"> 2. Add others to it </Header>
        <Header as="h4"> 3. Start contributing </Header>
        <Header as="h4"> 4. Members can withdraw funds wheneve they want </Header>
        </div>
      </div>

      <style jsx>{`
       #left-bar{
         float: left;
         width: 40%;
         height: 100%;
         position: absolute;
         background-color: #1AACFF;
       }
       #left-bar-content{
         padding-top: 25%;
         padding-left: 15%;
       }
       #logo{
         width: 5em;
       }
       #text-box{
         width: 75%;
         padding-top: 2em;
         color: white;
       }

       #right-side{
         margin-left: 40%;
       }

       #right-side-content{
         padding-left: 25%;
         padding-top: 25%;
       }

       #commune-count{
         padding-top: 4em;
         color: white;
         font-weight: 500

       }
      `}</style>

   </div>
   </div>
      
  )
}



