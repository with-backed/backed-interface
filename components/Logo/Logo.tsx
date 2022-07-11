import { useConfig } from 'hooks/useConfig';
import React from 'react';
import backedBunny from '../../public/logos/backed-bunny.png';
import borkedBunny from './borked-bunny.png';
import optimismBackedBunny from '../../public/logos/opbunny.png';
import polygonBackedBunny from '../../public/logos/pbunny.png';
import pepe from './pepe-bunny-line.png';
import { SupportedNetwork } from 'lib/config';
import styles from './Logo.module.css';

type ImageDirectory = {
  [key in SupportedNetwork]: StaticImageData;
};
const ERROR_LOGOS: ImageDirectory = {
  ethereum: borkedBunny,
  rinkeby: borkedBunny,
  optimism: borkedBunny,
  polygon: borkedBunny,
};

const NORMAL_LOGOS: ImageDirectory = {
  ethereum: backedBunny,
  rinkeby: backedBunny,
  optimism: optimismBackedBunny,
  polygon: polygonBackedBunny,
};

export function getLogo(
  network: SupportedNetwork,
  error?: boolean,
  codeActive?: boolean,
) {
  if (codeActive) {
    return pepe;
  }

  if (error) {
    return ERROR_LOGOS[network];
  }

  return NORMAL_LOGOS[network];
}

type LogoProps = {
  error?: boolean;
  codeActive?: boolean;
};
export const Logo = ({ error, codeActive }: LogoProps) => {
  const { network } = useConfig();
  return (
    <img
      className={styles.image}
      src={getLogo(network as SupportedNetwork, error, codeActive).src}
      alt="Backed logo"
    />
  );
};
