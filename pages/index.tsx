import Head from 'next/head'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import ConnectWallet from '../components/ConnectWallet'
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Button, Header } from 'semantic-ui-react'


export default function Home(){

  return (
   
   <div>
   Welcome! Homepage in progress, try  <Link href="/tickets/create" > Creating a ticket </Link>
   </div>
      
  )
}



