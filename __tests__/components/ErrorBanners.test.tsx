import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBanners } from 'components/ErrorBanners';
import { Message, useGlobalMessages } from 'hooks/useGlobalMessages';
import { useRouter } from 'next/router';
import { useNetwork, useSwitchNetwork } from 'wagmi';

jest.mock('hooks/useGlobalMessages');
jest.mock('next/router');
jest.mock('wagmi');

const mockedUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockedUseSwitchNetwork = useSwitchNetwork as jest.MockedFunction<
  typeof useSwitchNetwork
>;
const mockedUseGlobalMessages = useGlobalMessages as jest.MockedFunction<
  typeof useGlobalMessages
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

mockedUseNetwork.mockReturnValue({
  chain: { id: 1337 },
} as any);
mockedUseSwitchNetwork.mockReturnValue({
  switchNetworkAsync: jest.fn(),
} as any);

const messages: Message[] = [
  { kind: 'error', message: 'it borked' },
  { kind: 'info', message: 'it might bork' },
  { kind: 'success', message: 'it worked' },
];
mockedUseGlobalMessages.mockReturnValue({
  addMessage: jest.fn(),
  removeMessage: jest.fn(),
  messages,
});

mockedUseRouter.mockReturnValue({ pathname: '/loans/create' } as any);

describe('ErrorBanners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders WrongNetwork if you are on the wrong network', () => {
    const { getByText } = render(<ErrorBanners />);
    getByText(
      "You're viewing data from the Rinkeby network, but your wallet is connected to the Unknown network.",
    );
  });

  it('does not render WrongNetwork on error pages, because they have no network context', () => {
    mockedUseRouter.mockReturnValueOnce({ pathname: '/404' } as any);
    const { getByText } = render(<ErrorBanners />);
    expect(() =>
      getByText(
        "You're viewing data from the Rinkeby network, but your wallet is connected to the Unknown network.",
      ),
    ).toThrowError();
  });

  it('renders all the messages currently in state', () => {
    const { getByText } = render(<ErrorBanners />);
    messages.forEach(({ message }) => {
      getByText(message as string);
    });
  });
});
