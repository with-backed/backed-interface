import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const TIMESTAMP_POLL_INTERVAL = 14000;

/**
 * Exported only for use in stories. Please use TimestampProvider.
 */
export const TimestampContext = createContext<number | null>(null);

export function TimestampProvider({ children }: PropsWithChildren<{}>) {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const { jsonRpcProvider, chainId } = useConfig();

  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(jsonRpcProvider, chainId);
  }, [chainId, jsonRpcProvider]);

  useEffect(() => {
    const setLatestTimestamp = async () => {
      const height = await provider.getBlockNumber();
      const block = await provider.getBlock(height);
      setTimestamp(block.timestamp);
    };
    setLatestTimestamp();
    const intervalId = setInterval(setLatestTimestamp, TIMESTAMP_POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [provider, setTimestamp]);

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
