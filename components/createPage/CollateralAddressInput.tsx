import { ethers } from "ethers"
import React, { useState } from "react"
import Input from "../Input"

export default function CollateralAddressInput({setCollateralAddress}){
    const [value, setValue] = useState("")
    const [error, setError] = useState("")

    const handleValue = (newValue) => {
        if(newValue == value){
            return
        }
        setError('')
        setValue(newValue)

        if(newValue == ''){
            setCollateralAddress('')
            return
        }
        try{
            const address = ethers.utils.getAddress(newValue)
            setCollateralAddress(address)
        } catch (error){
            setError('invalid address')
        }
        
    }

    return(
            <Input type='text' title={'collateral NFT contract address'} value={value} placeholder={`address`} error={error} message={''} setValue={handleValue}/>
    )
}