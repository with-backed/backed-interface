import { ethers } from "ethers"
import { useState, useEffect } from "react"
import Input from "../../Input";

const SECONDS_IN_DAY = 60 * 60 * 24;

export default function DurationInput({minDurationSeconds, setDurationSeconds}){
    const [minDurationDays, ] = useState(parseFloat(minDurationSeconds.toString()) / SECONDS_IN_DAY)
    const [value, setValue] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const handleValue = (value) => {
        setError('')
        setMessage('')
        setValue(value)

        if(value == ''){
            setDurationSeconds(ethers.BigNumber.from(0))
            return 
        }

        const valueAsFloat = parseFloat(value)
        if(valueAsFloat < 0){
            setError('Rate cannot be negative')
            return
        }

        if (valueAsFloat < minDurationDays){
            setDurationSeconds(ethers.BigNumber.from(0))
            setError(`Minimum duration ${minDurationDays} days`)
            return
        }
        const valueInSeconds = ethers.BigNumber.from(Math.ceil(valueAsFloat * SECONDS_IN_DAY))
        setDurationSeconds(valueInSeconds)
    }

    return(
        <Input type='number' title={'duration in days'} value={value} placeholder={`Minimum duration: ${minDurationDays} days`} error={error} message={''} setValue={handleValue}/>
    )
}