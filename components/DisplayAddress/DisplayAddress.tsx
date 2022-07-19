import { useConfig } from 'hooks/useConfig';
import { addressToENS } from 'lib/account';
import React, { useEffect, useMemo, useState } from 'react';

export interface DisplayAddressProps {
  address: string;
  useEns?: boolean;
}

export function DisplayAddress({
  address,
  useEns = true,
}: DisplayAddressProps) {
  const { jsonRpcProvider } = useConfig();
  const [gotResponse, setGotResponse] = useState(false);
  const [name, setName] = useState<string | null>(null);

  const formattedAddress = useMemo(
    // leading 0x + first four digits + ellipsis + last 4 digits
    () => address.substring(0, 6) + '…' + address.substring(address.length - 4),
    [address],
  );

  useEffect(() => {
    async function getEnsName() {
      setName(null);
      try {
        // TODO: can we always use ethereum ENS lookup?
        let name = await addressToENS(address, jsonRpcProvider);

        setGotResponse(true);
        if (name) {
          setName(name);
        }
      } catch (error) {
        console.error(error);
        setGotResponse(true);
      }
    }

    if (useEns) getEnsName();
  }, [address, jsonRpcProvider, useEns]);

  if (!useEns) {
    return <span title={address}>{formattedAddress}</span>;
  }

  if (gotResponse) {
    return <span title={name || address}>{name || formattedAddress}</span>;
  }

  return null;
}
