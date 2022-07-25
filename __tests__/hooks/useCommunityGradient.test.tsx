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
    expect(result.current.to).toEqual('#f6f3fa');
  });

  it('adds messages', () => {
    const { result } = renderHook(() => useCommunityGradient(), { wrapper });

    act(() => {
      result.current.setGradient('#c0ffee');
    });

    expect(result.current.from).toEqual('#ffffff');
    expect(result.current.to).toEqual('#c0ffee');
  });
});
