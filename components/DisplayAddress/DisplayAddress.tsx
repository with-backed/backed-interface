import { useConfig } from 'hooks/useConfig';
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
  const { jsonRpcProvider } = useConfig();
  const [gotResponse, setGotResponse] = useState(false);
  const [addr, setAddr] = useState<string>(address);

  useEffect(() => {
    async function getEnsName() {
      try {
        let name = await addressToENS(address, jsonRpcProvider);

        setGotResponse(true);
        if (name) {
          setAddr(name);
        } else {
          setAddr(address);
        }
      } catch (error) {
        console.error(error);
        setGotResponse(true);
      }
    }

    if (useEns) getEnsName();
  }, [address, jsonRpcProvider, useEns]);

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
