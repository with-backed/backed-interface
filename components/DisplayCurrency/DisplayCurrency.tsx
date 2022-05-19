import { useCachedRates } from 'hooks/useCachedRates/useCachedRates';
import { ERC20Amount } from 'lib/erc20Helper';
import { useCallback, useEffect, useMemo, useState } from 'react';

type BaseProps = {
  currency: 'usd' | 'gbp' | 'eur';
};
type SingleAmount = BaseProps & {
  amount: ERC20Amount;
};
type AggregateAmounts = BaseProps & {
  amounts: ERC20Amount[];
};

export function DisplayCurrency(props: SingleAmount): JSX.Element | null;
export function DisplayCurrency(props: AggregateAmounts): JSX.Element | null;
export function DisplayCurrency(props: any): JSX.Element | null {
  const { currency } = props as SingleAmount | AggregateAmounts;
  const { getRate } = useCachedRates();

  const formatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', { currency, style: 'currency' });
  }, [currency]);

  const amounts = useMemo(
    () =>
      props.amount
        ? [(props as SingleAmount).amount]
        : (props as AggregateAmounts).amounts,
    [props],
  );

  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    if (!!process.env.NEXT_PUBLIC_COINGECKO_KILLSWITCH_ON) {
      setTotal(null);
      return;
    }

    async function fetchTotalAmounts() {
      let total = 0;
      for (let i = 0; i < amounts.length; i++) {
        const rate = await getRate(amounts[i].address, currency);

        if (!rate) {
          setTotal(null);
          return;
        }

        total += parseFloat(amounts[i].nominal) * rate;
      }
      setTotal(total);
    }
    fetchTotalAmounts();
  }, [amounts, currency, getRate]);

  if (!total) {
    return null;
  }

  return <>{formatter.format(total)}</>;
}
