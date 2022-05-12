import { Select } from 'components/Select';
import { useConfig } from 'hooks/useConfig';
import { configs } from 'lib/config';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo } from 'react';
import { SingleValue } from 'react-select';

type Option = {
  value: string;
  label: string;
};
const options: Option[] = Object.keys(configs).map((network) => ({
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

export const NetworkSelector = () => {
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

  return (
    <Select
      options={options}
      defaultValue={defaultValue}
      onChange={onChange}
      color="light"
    />
  );
};
