import { ERC20Amount, getTotalInUSD } from 'lib/loans/profileHeaderMethods';
import { useEffect, useState } from 'react';

type USDTotalsProps = {
  label: string;
  amounts: ERC20Amount[];
};

export function USDTotals({ label, amounts }: USDTotalsProps) {
  const [totalAmounts, setTotalAmounts] = useState('0');
  useEffect(() => {
    async function fetchTotalAmounts() {
      const total = await getTotalInUSD(amounts);
      setTotalAmounts(total.toFixed(2));
    }
    fetchTotalAmounts();
  }, [amounts]);

  return (
    <>
      <dt>{label}</dt>
      <dd>${totalAmounts}</dd>
    </>
  );
}
