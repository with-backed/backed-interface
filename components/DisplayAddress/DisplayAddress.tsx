import { useWeb3 } from 'hooks/useWeb3';
import { addressToENS } from 'lib/account';
import React, { useEffect, useState } from 'react';
import styles from './Address.module.css';

export interface DisplayAddressProps {
  address: string;
  useEns?: boolean;
}

export function DisplayAddress({
  address,
  useEns = true,
}: DisplayAddressProps) {
  const { library } = useWeb3();
  const [gotResponse, setGotResponse] = useState(false);
  const [addr, setAddr] = useState<string>(address);

  useEffect(() => {
    async function getEnsName() {
      try {
        let name = await addressToENS(address, library!);

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
  }, [address, library, useEns]);

  if (!useEns) {
    return (
      <span title={addr} className={styles.truncate}>
        {addr}
      </span>
    );
  }

  if (gotResponse) {
    return (
      <span title={addr} className={styles.truncate}>
        {addr}
      </span>
    );
  }

  return null;
}
