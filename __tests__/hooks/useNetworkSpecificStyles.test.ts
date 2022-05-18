import { renderHook } from '@testing-library/react-hooks';
import { useNetworkSpecificStyles } from 'hooks/useNetworkSpecificStyles';
import { STYLE_MAP } from 'hooks/useNetworkSpecificStyles/useNetworkSpecificStyles';
import { configs, SupportedNetwork } from 'lib/config';

const setPropertySpy = jest.spyOn(
  global.document.documentElement.style,
  'setProperty',
);

describe('useNetworkSpecificStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.each(Object.keys(configs).map((name) => [name]))(
    'calls setProperty the right number of times for %s',
    (network) => {
      expect(setPropertySpy).not.toHaveBeenCalled();
      renderHook(() => useNetworkSpecificStyles(network as SupportedNetwork));
      expect(setPropertySpy).toHaveBeenCalledTimes(
        STYLE_MAP[network as SupportedNetwork].length,
      );
    },
  );
});
