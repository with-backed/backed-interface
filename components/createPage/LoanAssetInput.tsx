import { showThrottleMessage } from "@ethersproject/providers"
import { ethers } from "ethers"
import React, { useState } from "react"
import { jsonRpcERC20Contract } from "../../lib/contracts"
import Input from "../Input"

export default function LoanAssetInput({setDecimals, setLoanAssetAddress}){
    const [message, setMessage] = useState('')
    const [value, setValue] = useState("")
    const [error, setError] = useState("")

    const handleValue = async (newValue) => {
        if(newValue == value){
            return
        }
        setError('')
        setValue(newValue)

        try{
            const address = ethers.utils.getAddress(newValue)
            const contract = jsonRpcERC20Contract(address)
            var error = false
            const symbol = await contract.symbol().catch(e => error = true)
            const decimals = await contract.decimals().catch(e => error = true)
            if(error){
                setError('Error fetching loan asset info, please ensure you have entered an ERC20 contract address')
                return
            }
            setMessage(symbol)
            setDecimals(decimals)
            setLoanAssetAddress(address)
        } catch (error){
            setError('invalid address')
        }
        
    }

    return(
            <Input type='text' title={'loan asset contract address'} value={value} placeholder={`e.g. DAI contract address`} error={error} message={message} setValue={handleValue}/>
    )
}