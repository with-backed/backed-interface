import { ethers } from 'ethers';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

const TIMESTAMP_POLL_INTERVAL = 14000;

/**
 * Exported only for use in stories. Please use TimestampProvider.
 */
export const TimestampContext = createContext<number | null>(null);

export function TimestampProvider({ children }: PropsWithChildren<{}>) {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const setLatestTimestamp = async () => {
      const height = await _provider.getBlockNumber();
      const block = await _provider.getBlock(height);
      setTimestamp(block.timestamp);
    };
    setLatestTimestamp();
    const intervalId = setInterval(setLatestTimestamp, TIMESTAMP_POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [setTimestamp]);

  return (
    <TimestampContext.Provider value={timestamp}>
      {children}
    </TimestampContext.Provider>
  );
}

export function useTimestamp() {
  const timestamp = useContext(TimestampContext);
  return timestamp;
}
