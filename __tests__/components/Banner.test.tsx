import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Banner } from 'components/Banner';
import userEvent from '@testing-library/user-event';
import { WrongNetwork } from 'components/Banner/messages';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useNetwork } from 'wagmi';

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useNetwork: jest.fn(),
}));

jest.mock('hooks/useGlobalMessages', () => ({
  ...jest.requireActual('hooks/useGlobalMessages'),
  useGlobalMessages: jest.fn(),
}));

const mockedUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
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
      let switchNetwork = jest.fn();
      let addMessage = jest.fn();
      beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue([{}, switchNetwork] as any);
        mockedUseGlobalMessages.mockReturnValue({
          addMessage,
        } as any);
      });
      it('renders', () => {
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        getByText(
          "You're viewing data from the Homestead network, but your wallet is connected to the Rinkeby network.",
        );
      });

      it('attempts to change network when pressing the button', () => {
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        const button = getByText('Switch to Homestead');
        expect(switchNetwork).not.toHaveBeenCalled();
        userEvent.click(button);
        expect(switchNetwork).toHaveBeenCalledWith(1);
      });

      it('attempts to change network when pressing the button', async () => {
        switchNetwork.mockRejectedValue('fail');
        const { getByText } = render(
          <WrongNetwork expectedChainId={1} currentChainId={4} />,
        );
        const button = getByText('Switch to Homestead');
        expect(addMessage).not.toHaveBeenCalled();
        userEvent.click(button);
        await waitFor(() => expect(addMessage).toHaveBeenCalled());
      });
    });
  });
});
