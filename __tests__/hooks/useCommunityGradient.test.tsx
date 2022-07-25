import { renderHook } from '@testing-library/react-hooks';
import {
  CommunityGradientProvider,
  useCommunityGradient,
} from 'hooks/useCommunityGradient';
import { act } from 'react-test-renderer';

const wrapper: React.FunctionComponent = ({ children }) => {
  return <CommunityGradientProvider>{children}</CommunityGradientProvider>;
};

describe('useCommunityGradient', () => {
  it('renders with default values', () => {
    const { result } = renderHook(() => useCommunityGradient(), { wrapper });

    expect(result.current.from).toEqual('#ffffff');
    expect(result.current.to).toEqual('var(--highlight-clickable-5)');
  });

  it('updates the gradient values', () => {
    const { result } = renderHook(() => useCommunityGradient(), { wrapper });

    act(() => {
      result.current.setGradient('Pink Protocol Lei');
    });

    expect(result.current.from).toEqual('#ffffff');
    expect(result.current.to).toEqual('#FF5CDB0A');
  });

  it('falls back to default when there is no gradient value in the table', () => {
    const { result } = renderHook(() => useCommunityGradient(), { wrapper });

    act(() => {
      result.current.setGradient('Punk Protocol Lei');
    });

    expect(result.current.from).toEqual('#ffffff');
    expect(result.current.to).toEqual('var(--highlight-clickable-5)');
  });
});
