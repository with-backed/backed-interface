import Head from 'next/head'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import ConnectWallet from '../components/ConnectWallet'
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Button, Header } from 'semantic-ui-react'

// const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

// const communeContract = new ethers.Contract(
//       process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
//       CommuneArtifact.abi,
//       _provider
//     );


export default function Home(){
  // const [communes, setCommunes] = useState(0)

  // const getNumberOfCommunes = async () => {
  //   const count = await communeContract.numberOfCommunes()
  //   setCommunes(count.toString())
  // }

  // useEffect(() => {
  //   getNumberOfCommunes()
  // }, [])

  return (
   
   <div>
   hey
   </div>
      
  )
}



