import { ethers } from 'ethers';

// TODO: fetch this from the contract on build? Maybe in an env var.
export const SCALAR = ethers.BigNumber.from(10).pow(10);
