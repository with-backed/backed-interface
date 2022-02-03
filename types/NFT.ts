import { ethers } from 'ethers';

export interface NFTEntity {
  id: string;
  identifier: ethers.BigNumber;
  uri: string;
  registry: {
    symbol: string;
    name: string;
  };
  approvals: Approval[];
}

interface Approval {
  id: string;
  approved: {
    id: string;
  };
}
