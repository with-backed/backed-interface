import { ethers } from "ethers";
import React, { useState, useEffect } from 'react';
import CommuneArtifact from "../contracts/Commune.json";
import TokenArtifact from "../contracts/Token.json";


declare global {
    interface Window {
        ethereum:any;
    }
}

export default function ConnectWallet({ setCommuneContract, setTokenContract }) {
    // If you don't specify a //url//, Ethers connects to the default 
  // (i.e. ``http:/\/localhost:8545``)
  var _connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum)

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
    const signer = provider.getSigner(0)
    console.log(signer._address)
    console.log(selectedAddress)

    const commune = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      CommuneArtifact.abi,
      provider.getSigner(0)
    );
    setCommuneContract(commune)

    const token = new ethers.Contract(
      "0x8464135c8F25Da09e49BC8782676a84730C318bC",
      TokenArtifact.abi,
      provider.getSigner(0)
    );
   
    setTokenContract(token)
    // provider.resetEventsBlock(0)


    // const _provider = ethers.providers.getDefaultProvider("http://localhost:8545")
    // _provider.resetEventsBlock(0)

    console.log(selectedAddress)
    const logs = await provider.getLogs({
        address: "0x2a810409872AfC346F9B5b26571Fd6eC42EA4849"
    });
    console.log(logs)
    const decodedEvents = logs.map(log => {
        const x = token.interface.decodeEventLog("Approval", log.data)
        console.log(x)
        return x
    });
    console.log("here")
    console.log(decodedEvents)

    getPastEvents(token)

  }

  return (
        <div onClick={_connectWallet}> Connect Wallet </div>
   
  )
}

const getPastEvents = async (tokeContract) => {
  // const provider = ethers.providers.getDefaultProvider("http://localhost:8545")
  // console.log("get past events")
  // const filter = tokeContract.filters["Approval"](...[null, "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"])
  

  // const logs = await provider.getLogs(filter)

  // const events = []
  // for (let i in logs) {
  //   events.push(tokeContract.interface.parseLog(logs[i]))
  // }

  // console.log(events)
  // return events
  const filter = await tokeContract.filters.Approval("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1")

  const test = await tokeContract.queryFilter(filter)
  console.log("test")
  console.log(test)
}