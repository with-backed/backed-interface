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
  const [gotResponse, setGotResponse] = useState(false);
  const [addr, setAddr] = useState<string>(address);

  useEffect(() => {
    async function getEnsName() {
      try {
        let name = await addressToENS(address);

        setGotResponse(true);
        if (name) {
          setAddr(name);
        }
      } catch (error) {
        console.error(error);
        setGotResponse(true);
      }
    }

    if (useEns) getEnsName();
  }, [address, useEns]);

  if (!useEns) {
    return <>{addr}</>;
  }

  if (gotResponse) {
    return <>{addr}</>;
  }

  return null;
}
