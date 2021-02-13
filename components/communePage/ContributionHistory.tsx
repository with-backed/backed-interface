import React, { useEffect, useState } from 'react';
import { ethers, BigNumber } from "ethers";
import { Item, Header, Container } from 'semantic-ui-react'
import CommuneArtifact from "../../contracts/Commune.json";


const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const communeContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      _provider
    );


export default function ContributionHistory({communeData}){
	const [events, setEvents] = useState([])
	const loadData = async () => {
		var results = []
		// if(events.length == 0){
			results = await communeContract.queryFilter("*")
			console.log(results)
			setEvents(results)

			// const listeners = communeContract.listeners()
			// if(listeners.length == 0){

			// 	communeContract.on("*", function(eventObject) {
					
			// 		// console.log("got event")
			// 		// console.log(eventObject)
			// 		if(events.length < results.length){
			// 			console.log(events)
			// 			console.log(results)
			// 			console.log("events shorter, bailing")
			// 			return
			// 		}
			// 		if(eventObject["transactionHash"] == events[0]["transactionHash"]){
			// 			return
			// 		}
			// 	    const x = events
			// 	    x.push(eventObject)
			// 	    setEvents(x)
			// 	});
			// }
		// }

		
		
	}
	useEffect(() => {
		loadData()
	}, [])
	
	return(
		<div>
		<Header> Event History </Header>
		<EventFeed communeData={communeData} events={events} />
		</div>
		)

}

const EventFeed = ({communeData, events}) => {
	const eventElements = events
		.sort((a,b) => {
			return b.blockNumber - a.blockNumber
		})
		.filter((e) => e.args.commune != null && e.args.commune.toNumber() == communeData.id)
		.map((e, i) => {
		return <Event event={parseEvent(e, communeData)} key={i} />
	})

	return(
		<Item.Group divided> 
		
		{eventElements} 
		</Item.Group>
		)
}

const Event = ({event}) => {

	return(
		<Item>
		<Item.Content> 
	      <Item.Header as="h5">
	        {event["title"]}
	      </Item.Header>
	      <Item.Description>
	      {event["description"]}
	      </Item.Description>
	      
	      <Item.Extra>
	      	Block: {event["blockNumber"]}, TxHash: <a href={"https://etherscan.io/tx/" + event["txHash"]}> {event["txHash"]} </a>
	      	</Item.Extra>
	      	</Item.Content>
      	</Item>
		)
}

const parseEvent = (event, communeData) => {
	var result = {}
	result["title"] =  event["event"]
	result["blockNumber"] = event["blockNumber"]
	result["txHash"] = event["transactionHash"]
	const args = event["args"]
	switch(event["event"]) {
		case "UpdateCommuneController":
			break;
		case "AddCommuneMember":
			result["description"] = args["account"] + " was added to the commune."
			break;
		case "RemoveCommuneMember":
			result["description"] = args["account"] + " was removed from the commune."
			break;
		case "Withdraw":
			result["description"] = args["account"] + " withdrew " + readableValue(args["amount"], communeData.assetDecimals, communeData.assetSymbol)
			break;
		case "WithdrawBatch":
			break;
		case "URI":
			result["title"] =  "CreateCommune"
			
			break;
		case "Contribute":
			result["description"] = args["account"] + " contributed " + readableValue(args["amount"], communeData.assetDecimals, communeData.assetSymbol) + "."
			break;
	}
	return result
}

const readableValue = (value, decimals, symbol) => {
	return parseInt(value.toString()) / Math.pow(10, decimals) + " " + symbol
}
