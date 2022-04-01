import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectWallet } from 'components/ConnectWallet';
import { DisplayAddressProps } from 'components/DisplayAddress/DisplayAddress';
import { useAccount, useConnect } from 'wagmi';

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useConnect: jest.fn(),
  useAccount: jest.fn(),
}));

jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

// Mocking this to suppress ethers error that adds console noise.
// Let's test DisplayAddress separately and/or make it easier to mock the dep.
jest.mock('components/DisplayAddress', () => ({
  ...jest.requireActual('components/DisplayAddress'),
  DisplayAddress: (props: DisplayAddressProps) => <span>{props.address}</span>,
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockUseConnect = useConnect as jest.MockedFunction<typeof useConnect>;
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

describe('ConnectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccount.mockReturnValue([
      { data: { address: undefined } },
      mockDisconnect,
    ] as any);
    mockUseConnect.mockReturnValue([
      {
        data: {
          connectors: [
            {
              id: 'injected',
              ready: true,
            },
            {
              id: 'walletLink',
              ready: true,
            },
            {
              id: 'walletConnect',
              ready: true,
            },
          ],
        },
      },
      mockConnect,
    ] as any);
    window.open = jest.fn();
  });

  it('renders', () => {
    const { getByText } = render(<ConnectWallet />);
    getByText('Connect Wallet');
  });

  it('shows a menu when clicked that allows deactivation and profile navigation', () => {
    mockUseAccount.mockReturnValue([
      {
        data: {
          address: '0xthisisareallylongaddresswhichisvisuallytruncatedbycss',
        },
      },
      mockDisconnect,
    ] as any);
    const { getByText } = render(<ConnectWallet />);

    const menuButton = getByText(
      '0xthisisareallylongaddresswhichisvisuallytruncatedbycss',
    );

    userEvent.click(menuButton);

    const profileLink = getByText('Profile');
    expect(profileLink.getAttribute('href')).toEqual(
      '/profile/0xthisisareallylongaddresswhichisvisuallytruncatedbycss',
    );

    expect(mockDisconnect).not.toHaveBeenCalled();
    const disconnectButton = getByText('Disconnect');
    userEvent.click(disconnectButton);
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
