import { GetServerSideProps } from 'next'
import { ethers } from "ethers";
import CommuneArtifact from "../contracts/Commune.json";
import React, { useEffect, useState } from 'react';
import { getCommuneData } from '../lib/communes'
import { Dimmer, Loader } from 'semantic-ui-react'
import Commune from "./Commune"


const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const communeContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      _provider
    );

export default function Test({communeID}){
	const [communeData, setCommuneData] = useState(null)

	const fetchData = async () => {
		if(communeID == null){
			return
		}
		const communeData = await getCommuneData(communeID + "")
		console.log(communeData)
		setCommuneData(communeData)
	}

	useEffect(() => {
		fetchData()
	}, [communeID])
	return(
		<div> 
		{communeData == null ? 
		<Dimmer active={communeData == null} inverted>
        <Loader inverted content='Loading' />
      	</Dimmer>
      	 :
		<Commune {...communeData}/>
		}
		

		 </div>
		)
}

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
// 	console.log("params")
// 	console.log(params)
//   const communeData = await communeCont.getCommune(bigInt)
//   return {
//     props: {}
//   }
// }