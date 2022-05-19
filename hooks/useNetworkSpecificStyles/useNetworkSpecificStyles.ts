import { SupportedNetwork } from 'lib/config';
import { useEffect } from 'react';

type StyleRule = [variableName: string, style: string];

const RADIAL_NAME = '--background-radial-gradient';
const RADIAL_DEFAULT = 'radial-gradient(#ffffff, #f6f2f0)';
const BASE_RADIAL: StyleRule = [RADIAL_NAME, RADIAL_DEFAULT];

export const STYLE_MAP: { [network in SupportedNetwork]: StyleRule[] } = {
  ethereum: [BASE_RADIAL],
  rinkeby: [BASE_RADIAL],
  optimism: [[RADIAL_NAME, 'var(--optimistic-red-10)']],
  polygon: [[RADIAL_NAME, 'var(--polygon-purple-10)']],
};

export function useNetworkSpecificStyles(network: SupportedNetwork) {
  useEffect(() => {
    const rules = STYLE_MAP[network];
    rules.forEach(([variableName, style]) => {
      document.documentElement.style.setProperty(variableName, style);
    });
  }, [network]);
}
