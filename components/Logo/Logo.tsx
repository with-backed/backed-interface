import { useConfig } from 'hooks/useConfig';
import React from 'react';
import backedBunny from './backed-bunny.png';
import borkedBunny from './borked-bunny.png';
import optimismBackedBunny from './opbunny.png';
import optimismBorkedBunny from './opborked.png';
import pepe from './pepe-bunny-line.png';
import { SupportedNetwork } from 'lib/config';
import styles from './Logo.module.css';

type ImageDirectory = {
  [key in SupportedNetwork]: StaticImageData;
};
const ERROR_LOGOS: ImageDirectory = {
  ethereum: borkedBunny,
  rinkeby: borkedBunny,
  optimism: optimismBorkedBunny,
};

const NORMAL_LOGOS: ImageDirectory = {
  ethereum: backedBunny,
  rinkeby: backedBunny,
  optimism: optimismBackedBunny,
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
    console.log({ error, network, codeActive });
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
      priority
    />
  );
};
