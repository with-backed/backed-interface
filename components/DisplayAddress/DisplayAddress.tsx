import { addressToENS } from 'lib/account';
import React, { useEffect, useState } from 'react';

export interface DisplayAddressProps {
  address: string;
  useEns?: boolean;
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
