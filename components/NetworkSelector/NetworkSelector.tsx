import { Select } from 'components/Select';
import { useConfig } from 'hooks/useConfig';
import { configs, prodConfigs } from 'lib/config';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo } from 'react';
import { SingleValue } from 'react-select';
import styles from './NetworkSelector.module.css';

type Option = {
  value: string;
  label: string;
};
const options =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? prodConfigs.map(({ network }) => ({
        value: network,
        label: capitalize(network),
      }))
    : Object.keys(configs).map((network) => ({
        value: network,
        label: capitalize(network),
      }));

const NETWORK_REGEXP = /\/network\/[^\/]*(.*)$/;

/**
 * @param path Typically the `route` part of `next/router`
 * @returns The route without the /network/[network] prefix
 */
function pathWithoutNetwork(path: string) {
  const matches = path.match(NETWORK_REGEXP);
  return matches![1];
}

/**
 * @param path A path, without the /network/[network] prefix
 * @returns Whether we should return to the homepage when changing network. If not, show the same page on the new network.
 */
function shouldReturnToHomepage(path: string): boolean {
  if (path.startsWith('/loans') && !path.endsWith('create')) {
    // Loan IDs are not stable between networks. If the user is on /loans/1337
    // on Optimism, then changes to a chain where there are only 1336 loans,
    // we'd direct them to an error page. So instead, drop them at the homepage.
    return true;
  }

  return false;
}

type NetworkSelectorProps = {
  isErrorPage?: boolean;
};
export const NetworkSelector = ({ isErrorPage }: NetworkSelectorProps) => {
  const { network } = useConfig();
  const { push, route } = useRouter();

  const onChange = useCallback(
    (option: SingleValue<Option>) => {
      if (option && option.value !== network) {
        const currentPath = pathWithoutNetwork(route);
        const returnHome = shouldReturnToHomepage(currentPath);
        if (returnHome) {
          push('/network/' + option.value);
        } else {
          push('/network/' + option.value + currentPath);
        }
      }
    },
    [network, push, route],
  );

  const defaultValue = useMemo(
    () => options.find((o) => o.value === network),
    [network],
  );

  if (isErrorPage) {
    // The 404 page is statically generated so it thinks the network is always
    // ethereum. This could result in some unintuitive behavior, so just ditch
    // the network selector there.
    return null;
  }

  return (
    <div className={styles.container}>
      <Select
        options={options}
        onChange={onChange}
        color="clickable"
        value={defaultValue}
      />
    </div>
  );
};
