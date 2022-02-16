import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

export interface DisplayAddressProps {
  address: string;
  useEns?: boolean;
}

function addressToENS(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.lookupAddress(address);
}

export function DisplayAddress({
  address,
  useEns = true,
}: DisplayAddressProps) {
  const [addr, setAddr] = useState<string>(address);

  useEffect(() => {
    async function getEnsName() {
      try {
        let name = await addressToENS(address);

        if (name) setAddr(name);
      } catch (error) {
        console.error(error);
      }
    }

    if (useEns) getEnsName();
  }, [address, useEns]);

  return <>{addr}</>;
}
