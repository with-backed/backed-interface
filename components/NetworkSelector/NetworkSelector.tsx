import { Select } from 'components/Select';
import { useConfig } from 'hooks/useConfig';
import { configs } from 'lib/config';
import capitalize from 'lodash/capitalize';
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

export const NetworkSelector = () => {
  const { network } = useConfig();

  const onChange = useCallback(
    (option: SingleValue<Option>) => {
      if (option && option.value !== network) {
        window.location.assign('/network/' + option.value);
      }
    },
    [network],
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
