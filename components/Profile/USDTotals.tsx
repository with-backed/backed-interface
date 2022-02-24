import { ERC20Amount, getTotalInUSD } from 'lib/loans/profileHeaderMethods';
import { useEffect, useState } from 'react';

type USDTotalsProps = {
  amounts: ERC20Amount[];
};

export function USDTotals({ amounts }: USDTotalsProps) {
  const [totalInUSD, setTotalInUSD] = useState<string>('$0.00');
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_COINGECKO_KILLSWITCH_ON) {
      setTotalInUSD('');
      return;
    }

    async function fetchTotalAmounts() {
      const total = await getTotalInUSD(amounts);
      if (!total) {
        setTotalInUSD('');
      } else {
        setTotalInUSD(`$${total.toFixed(2)}`);
      }
    }

    fetchTotalAmounts();
  }, [amounts]);

  return <>{totalInUSD}</>;
}
