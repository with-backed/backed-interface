import noop from 'lodash/noop';
import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from 'react';

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
  const [account, setAccount] = useState<string | null>(null);

  // On first load, see if there's already a connected account.
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.sendAsync(
        {
          method: 'eth_accounts',
          params: [],
          jsonrpc: '2.0',
          id: new Date().getTime(),
        },
        (error: any, result: any) => {
          if (error) {
            console.error(error);
          } else {
            const addressList = result.result;
            if (addressList && addressList.length > 0) {
              setAccount(addressList[0]);
            }
          }
        },
      );
    }
  });

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
