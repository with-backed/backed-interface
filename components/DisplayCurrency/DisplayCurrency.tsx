import { convertERC20ToCurrency, ERC20Amount } from 'lib/erc20Helper';
import { useEffect, useMemo, useState } from 'react';

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
  // currency is a common property, this is safe
  const { currency } = props as SingleAmount | AggregateAmounts;

  // Better to use this, automatically supports various currencies and locales
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
      const total = await convertERC20ToCurrency(amounts, currency);
      if (!total) {
        setTotal(null);
      } else {
        setTotal(total);
      }
    }
    fetchTotalAmounts();
  }, [amounts, currency]);

  if (!total) {
    return null;
  }

  return <>{formatter.format(total)}</>;
}
