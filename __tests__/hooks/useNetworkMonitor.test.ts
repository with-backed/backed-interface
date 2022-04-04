import { renderHook } from '@testing-library/react-hooks';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useNetworkMonitor } from 'hooks/useNetworkMonitor';
import { useNetwork } from 'wagmi';

jest.mock('hooks/useGlobalMessages', () => ({
  ...jest.requireActual('hooks/useGlobalMessages'),
  useGlobalMessages: jest.fn(),
}));

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useNetwork: jest.fn(),
}));

const mockedUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockedUseGlobalMessages = useGlobalMessages as jest.MockedFunction<
  typeof useGlobalMessages
>;

const addMessage = jest.fn();
const removeMessage = jest.fn();

const mockNetwork = (id?: number) =>
  mockedUseNetwork.mockReturnValue([{ data: { chain: { id } } }] as any);

describe('useNetworkMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNetwork.mockReturnValue([{ chain: { id: 1 } }] as any);
    mockedUseGlobalMessages.mockReturnValue({
      addMessage,
      removeMessage,
      messages: [],
    });
  });

  it('does nothing when not connected', async () => {
    mockNetwork();
    const { result } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('does nothing when connected to correct network', async () => {
    mockNetwork(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string));
    const { result } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('adds a message when connected to wrong network, then removes one when resolved', () => {
    mockNetwork(1282345);
    const { result, rerender } = renderHook(() => useNetworkMonitor());
    result.current;
    expect(addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
      }),
    );
    expect(removeMessage).not.toHaveBeenCalled();

    mockNetwork(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string));

    rerender();

    expect(removeMessage).toHaveBeenCalled();
  });
});
