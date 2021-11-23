import noop from 'lodash/noop';
import React, { createContext, FunctionComponent, useState } from 'react';

type AccountContext = {
  /** The address of the connected wallet, if present. */
  account: string | null;
  setAccount: (account: string) => void;
};

export const AccountContext = createContext<AccountContext>({
  account: null,
  // Just to satisfy the type; the provider will always have a setter.
  setAccount: noop,
});

export const AccountProvider: FunctionComponent = ({ children }) => {
  const [account, setAccount] = useState<string | null>(
    '0x31fd8d16641d06e0eada78b475ae367163704774',
  );
  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
