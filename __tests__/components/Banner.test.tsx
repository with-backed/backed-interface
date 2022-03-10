import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { Banner } from 'components/Banner';
import userEvent from '@testing-library/user-event';
import { WrongNetwork } from 'components/Banner/messages';
import { useWeb3 } from 'hooks/useWeb3';
import { useGlobalMessages } from 'hooks/useGlobalMessages';

jest.mock('hooks/useWeb3', () => ({
  ...jest.requireActual('hooks/useWeb3'),
  useWeb3: jest.fn(),
}));

jest.mock('hooks/useGlobalMessages', () => ({
  ...jest.requireActual('hooks/useGlobalMessages'),
  useGlobalMessages: jest.fn(),
}));

const mockedUseWeb3 = useWeb3 as jest.MockedFunction<typeof useWeb3>;
const mockedUseGlobalMessages = useGlobalMessages as jest.MockedFunction<
  typeof useGlobalMessages
>;

describe('Banner', () => {
  it('renders', () => {
    const { getByText } = render(<Banner kind="success">Hello</Banner>);
    getByText('Hello');
  });

  it('calls the provided close function when the button is clicked', () => {
    const close = jest.fn();
    const { getByRole } = render(
      <Banner kind="success" close={close}>
        Hello
      </Banner>,
    );
    const button = getByRole('button');
    expect(close).not.toHaveBeenCalled();
    userEvent.click(button);
    expect(close).toHaveBeenCalled();
  });

  describe('messages', () => {
    describe('WrongNetwork', () => {
      let jsonRpcFetchFunc = jest.fn();
      let addMessage = jest.fn();
      beforeEach(() => {
        jest.clearAllMocks();
        mockedUseWeb3.mockReturnValue({
          library: {
            jsonRpcFetchFunc,
          },
        } as any);
        mockedUseGlobalMessages.mockReturnValue({
          addMessage,
        } as any);
      });
      it('renders', () => {
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        getByText(
          "You're viewing data from the Mainnet network, but your wallet is connected to the Rinkeby network.",
        );
      });

      it('attempts to change network when pressing the button', () => {
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        const button = getByText('Switch to Mainnet');
        expect(jsonRpcFetchFunc).not.toHaveBeenCalled();
        userEvent.click(button);
        expect(jsonRpcFetchFunc).toHaveBeenCalledWith(
          'wallet_switchEthereumChain',
          [{ chainId: '0x1' }],
        );
      });

      it('attempts to change network when pressing the button', async () => {
        jsonRpcFetchFunc.mockRejectedValue('fail');
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        const button = getByText('Switch to Mainnet');
        expect(addMessage).not.toHaveBeenCalled();
        userEvent.click(button);
        await waitFor(() => expect(addMessage).toHaveBeenCalled());
      });
    });
  });
});
