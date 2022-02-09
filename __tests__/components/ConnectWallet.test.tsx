import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectWallet } from 'components/ConnectWallet';
import { useWeb3 } from 'hooks/useWeb3';
import { DisplayAddressProps } from 'components/DisplayAddress/DisplayAddress';

jest.mock('hooks/useWeb3', () => ({
  ...jest.requireActual('hooks/useWeb3'),
  useWeb3: jest.fn(),
}));

// Mocking this to suppress ethers error that adds console noise.
// Let's test DisplayAddress separately and/or make it easier to mock the dep.
jest.mock('components/DisplayAddress', () => ({
  ...jest.requireActual('components/DisplayAddress'),
  DisplayAddress: (props: DisplayAddressProps) => <span>{props.address}</span>,
}));

const mockActivate = jest.fn();
const mockDeactivate = jest.fn();
const mockOpen = jest.fn();
const mockUseWeb3 = useWeb3 as jest.MockedFunction<typeof useWeb3>;

describe('ConnectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWeb3.mockReturnValue({
      activate: mockActivate,
      active: false,
      setError: jest.fn(),
      deactivate: mockDeactivate,
    });
    window.open = mockOpen;
  });

  it('renders', () => {
    const { getByText } = render(<ConnectWallet />);
    getByText('Connect');
  });

  it('directs users to MetaMask website if there is no injected provider', () => {
    const { getByText } = render(<ConnectWallet />);
    const button = getByText('Connect');

    userEvent.click(button);

    expect(window.open).not.toHaveBeenCalled();
    const metamask = getByText('MetaMask');
    userEvent.click(metamask);
    expect(window.open).toHaveBeenCalledWith('https://metamask.io', '_blank');
  });

  it('connects through Wallet Connect', () => {
    window.ethereum = true;
    const { getByText } = render(<ConnectWallet />);
    const button = getByText('Connect');

    userEvent.click(button);

    expect(mockActivate).not.toHaveBeenCalled();
    const walletConnect = getByText('Wallet Connect');
    userEvent.click(walletConnect);
    expect(mockActivate).toHaveBeenCalled();
  });

  it('connects through Wallet Link', () => {
    window.ethereum = true;
    const { getByText } = render(<ConnectWallet />);
    const button = getByText('Connect');

    userEvent.click(button);

    expect(mockActivate).not.toHaveBeenCalled();
    const walletLink = getByText('Coinbase Wallet');
    userEvent.click(walletLink);
    expect(mockActivate).toHaveBeenCalled();
  });

  it('connects through MetaMask if there is an injected provider', () => {
    window.ethereum = true;
    const { getByText } = render(<ConnectWallet />);
    const button = getByText('Connect');

    userEvent.click(button);

    expect(mockActivate).not.toHaveBeenCalled();
    const metamask = getByText('MetaMask');
    userEvent.click(metamask);
    expect(mockActivate).toHaveBeenCalled();
  });

  it('shows a menu when clicked that allows deactivation and profile navigation', () => {
    mockUseWeb3.mockReturnValue({
      activate: mockActivate,
      active: false,
      setError: jest.fn(),
      deactivate: mockDeactivate,
      account: '0xaddress',
    });
    const { getByText } = render(<ConnectWallet />);

    const menuButton = getByText('0xaddress');

    userEvent.click(menuButton);

    const profileLink = getByText('Profile');
    expect(profileLink.getAttribute('href')).toEqual('/profile/0xaddress');

    expect(mockDeactivate).not.toHaveBeenCalled();
    const disconnectButton = getByText('Disconnect');
    userEvent.click(disconnectButton);
    expect(mockDeactivate).toHaveBeenCalled();
  });
});
