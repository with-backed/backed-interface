import { createContext, useCallback, useContext, useState } from 'react';

const hasCollapsedHeaderInfoContext = createContext<{
  hasCollapsed: boolean;
  setHasCollapsed: (value: boolean) => void;
}>({} as any);

export function HasCollapsedHeaderInfoProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [hasCollapsed, setHasCollapsed] = useState(false);
  const { Provider } = hasCollapsedHeaderInfoContext;

  const value = { hasCollapsed, setHasCollapsed };
  return <Provider value={value}>{children}</Provider>;
}

export function useHasCollapsedHeaderInfo() {
  const { hasCollapsed, setHasCollapsed } = useContext(
    hasCollapsedHeaderInfoContext,
  );

  const onCollapse = useCallback(
    () => setHasCollapsed(true),
    [setHasCollapsed],
  );

  return { hasCollapsed, onCollapse };
}
