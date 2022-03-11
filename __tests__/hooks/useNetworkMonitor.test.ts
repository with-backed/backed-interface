import { renderHook } from '@testing-library/react-hooks';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useNetworkMonitor } from 'hooks/useNetworkMonitor';
import { useWeb3 } from 'hooks/useWeb3';
import { act } from 'react-test-renderer';

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

const addMessage = jest.fn();
const removeMessage = jest.fn();

describe('useNetworkMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseWeb3.mockReturnValue({ chainId: 1 } as any);
    mockedUseGlobalMessages.mockReturnValue({
      addMessage,
      removeMessage,
      messages: [],
    });
  });

  it('does nothing when not connected', async () => {
    mockedUseWeb3.mockReturnValue({ chainId: undefined } as any);
    const { result } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('does nothing when connected to correct network', async () => {
    mockedUseWeb3.mockReturnValue({
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string),
    } as any);
    const { result } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('adds a message when connected to wrong network, then removes one when resolved', () => {
    const { result, rerender } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
      }),
    );
    expect(removeMessage).not.toHaveBeenCalled();

    mockedUseWeb3.mockReturnValue({
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string),
    } as any);

    rerender();

    expect(removeMessage).toHaveBeenCalled();
  });
});
