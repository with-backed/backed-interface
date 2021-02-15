import { getAllCommuneIDs, getCommuneData } from '../../lib/communes'
import Head from 'next/head'
import utilStyles from '../../styles/utils.module.css'
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import { Message, Button, Label, Container } from 'semantic-ui-react'
import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';

import CommunePage from '../../components/CommunePage'
import { CommuneData } from "../../lib/CommuneData"
import CommuneArtifact from "../../contracts/Commune.json";

import { useRouter } from 'next/router'
import Test from "../../components/Test"

export default function Communes() {
  const router = useRouter()
  const { id } = router.query

  return <Test communeID={id} />
}