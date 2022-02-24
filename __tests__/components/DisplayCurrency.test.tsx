import React from 'react';
import { render, screen } from '@testing-library/react';
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
  address: '0xc778417e063141139fce010982780140aa0cd5ab',
  symbol: 'WETH',
  nominal: '200.0',
};

describe('DisplayCurrency', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockUnitPriceForCoin.mockResolvedValue(1.01);
  });
  it('renders the converted amount with one ERC20Amount to convert', async () => {
    render(<DisplayCurrency amount={amount} currency="usd" />);

    expect(mockUnitPriceForCoin).toHaveBeenCalledWith(amount.address, 'usd');
    await screen.findByText('$101.00');
  });

  it('renders the converted amount with multiple ERC20Amount to convert', async () => {
    render(<DisplayCurrency amounts={[amount, amountTwo]} currency="usd" />);

    await screen.findByText('$303.00');

    expect(mockUnitPriceForCoin).toHaveBeenCalledTimes(2);
    expect(mockUnitPriceForCoin).toHaveBeenCalledWith(amount.address, 'usd');
    expect(mockUnitPriceForCoin).toHaveBeenCalledWith(amountTwo.address, 'usd');
  });

  it('makes no calls to coingecko if killswitch is on', async () => {
    process.env.NEXT_PUBLIC_COINGECKO_KILLSWITCH_ON = 'true';
    render(<DisplayCurrency amounts={[amount, amountTwo]} currency="usd" />);

    expect(mockUnitPriceForCoin).not.toHaveBeenCalled();
    process.env.NEXT_PUBLIC_COINGECKO_KILLSWITCH_ON = undefined;
  });
});
