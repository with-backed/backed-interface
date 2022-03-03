import { ethers } from 'ethers';

export interface NFTEntity {
  id: string;
  identifier: ethers.BigNumber;
  uri?: string | null;
  registry: {
    symbol?: string | null;
    name?: string | null;
  };
  approvals: Approval[];
}

interface Approval {
  id: string;
  approved: {
    id: string;
  };
}
