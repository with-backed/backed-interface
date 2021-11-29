import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

const TIMESTAMP_POLL_INTERVAL = 14000;

export function useTimestamp() {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const refreshTimestamp = useCallback(async () => {
    const height = await _provider.getBlockNumber();
    const block = await _provider.getBlock(height);
    setTimestamp(block.timestamp);
  }, [setTimestamp]);

  useEffect(() => {
    refreshTimestamp();
    const timeOutId = setInterval(
      () => refreshTimestamp(),
      TIMESTAMP_POLL_INTERVAL,
    );
    return () => clearInterval(timeOutId);
  }, [refreshTimestamp]);

  return timestamp;
}
