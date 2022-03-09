import { renderHook } from '@testing-library/react-hooks';
import {
  GlobalMessagingProvider,
  Message,
  useGlobalMessages,
} from 'hooks/useGlobalMessages';
import { act } from 'react-test-renderer';

const wrapper: React.FunctionComponent = ({ children }) => {
  return <GlobalMessagingProvider>{children}</GlobalMessagingProvider>;
};

const errorMessage: Message = {
  kind: 'error',
  message: 'Something went wrong',
};

const infoMessage: Message = {
  kind: 'info',
  message: 'Something went',
};

const successMessage: Message = {
  kind: 'success',
  message: 'Something went well',
};

describe('useGlobalMessages', () => {
  it('renders', () => {
    const { result } = renderHook(() => useGlobalMessages(), { wrapper });

    expect(result.current.messages).toEqual([]);
  });

  it('adds messages', () => {
    const { result } = renderHook(() => useGlobalMessages(), { wrapper });

    act(() => {
      result.current.addMessage(errorMessage);
      result.current.addMessage(infoMessage);
      result.current.addMessage(successMessage);
    });

    expect(result.current.messages).toEqual([
      errorMessage,
      infoMessage,
      successMessage,
    ]);
  });

  it('removes messages', () => {
    const { result } = renderHook(() => useGlobalMessages(), { wrapper });

    act(() => {
      result.current.addMessage(errorMessage);
      result.current.addMessage(infoMessage);
      result.current.addMessage(successMessage);
    });

    act(() => {
      result.current.removeMessage(errorMessage);
    });
    expect(result.current.messages).toEqual([infoMessage, successMessage]);

    act(() => {
      result.current.removeMessage(infoMessage);
    });
    expect(result.current.messages).toEqual([successMessage]);

    act(() => {
      result.current.removeMessage(successMessage);
    });
    expect(result.current.messages).toEqual([]);
  });
});
