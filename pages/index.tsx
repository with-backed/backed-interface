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
      
      Coming sooner

   </div>
   </div>
      
  )
}



