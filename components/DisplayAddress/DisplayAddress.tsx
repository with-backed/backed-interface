import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

interface Address {
  address: string;
  useEns?: boolean;
}

function addressToENS(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.lookupAddress(address);
}

function shortenAddress(address: string) {
  if (address.substring(0, 2) != '0x') return address;
  return (
    address.substring(0, 6) + '...' + address.substring(address.length - 4)
  );
}

export function DisplayAddress({ address, useEns = true }: Address) {
  const [addr, setAddr] = useState<string>(shortenAddress(address));

  useEffect(() => {
    async function getEnsName() {
      let name = await addressToENS(address);
      if (name) setAddr(name);
    }

    if (useEns) getEnsName();
  }, [address, useEns]);

  return <span>{addr}</span>;
}
