import { ethers } from "ethers";

const SECONDS_IN_DAY = 60 * 60 * 24;

export function secondsToDays(seconds){
    return seconds / SECONDS_IN_DAY
}

export function secondsBigNumToDays(seconds){
    return parseFloat(seconds.toString()) / SECONDS_IN_DAY
}

export function daysToSecondsBigNum(days){
    return ethers.BigNumber.from(days * SECONDS_IN_DAY)
}