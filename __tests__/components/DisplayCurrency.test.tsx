import React from 'react';
import { render } from '@testing-library/react';
import { getUnitPriceForCoin } from 'lib/coingecko';
import { DisplayCurrency } from 'components/DisplayCurrency/DisplayCurrency';
import { ERC20Amount } from 'lib/erc20Helper';

jest.mock('lib/coingecko', () => ({
  getUnitPriceForCoin: jest.fn(),
}));

const mockUnitPriceForCoin = getUnitPriceForCoin as jest.MockedFunction<
  typeof getUnitPriceForCoin
>;

const amount: ERC20Amount = {
  address: '0x6916577695D0774171De3ED95d03A3239139Eddb',
  symbol: 'DAI',
  nominal: '100.0',
};

const amountTwo: ERC20Amount = {
  address: '0x6916577695D0774171De3ED95d03A3239139Eddb',
  symbol: 'DAI',
  nominal: '200.0',
};

const DisplayedCurrencyComponent = ({
  displayedCurrency,
}: {
  displayedCurrency: React.ReactNode;
}) => <div>{displayedCurrency}</div>;

describe('DisplayCurrency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnitPriceForCoin.mockResolvedValue(1.01);
  });
  it('renders the converted amount with one ERC20Amount to convert', () => {
    const { getByText } = render(
      <DisplayedCurrencyComponent
        displayedCurrency={DisplayCurrency({ amount, currency: 'usd' })}
      />,
    );

    expect(mockUnitPriceForCoin).toHaveBeenCalledWith([amount], 'usd');
    getByText('$101.00');
  });

  it('renders the converted amount with multiple ERC20Amount to convert', async () => {
    const { getByText } = render(
      <DisplayedCurrencyComponent
        displayedCurrency={DisplayCurrency({
          amounts: [amount, amountTwo],
          currency: 'usd',
        })}
      />,
    );

    expect(mockUnitPriceForCoin).toHaveBeenCalledWith(
      [amount, amountTwo],
      'usd',
    );
    getByText('$303.00');
  });
});
