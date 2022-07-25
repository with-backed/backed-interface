import {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useState,
} from 'react';

const FROM = '#ffffff';
const DEFAULT_TO = 'var(--highlight-clickable-5)';

const accessoryToValue: Record<string, string> = {
  'Gold Chain Contributor': '#ffcf530a',
  'Gold Key': '#F8D2700a',
  'Preserver of Wisdom': '#FFB6530a',
  'Pink Protocol Lei': '#FF5CDB0A',
  'Purple Community Scarf': '#5653ff0a',
  'Alpha-Snake': '#86A3620a',
  'Super Chain Contributor': '#ffcf530a',
  'Super Protocol Lei': '#FF5CDB0a',
  'Super Community Scarf': '#5653ff0a',
};

export const CommunityGradientContext = createContext({
  from: FROM,
  to: DEFAULT_TO,
  setGradient: (accessoryName: string) => {},
});

export const CommunityGradientProvider: FunctionComponent = ({ children }) => {
  const [{ from, to }, setGradientState] = useState({
    from: FROM,
    to: DEFAULT_TO,
  });
  const setGradient = useCallback((accessoryName: string) => {
    const toValue = accessoryToValue[accessoryName] || DEFAULT_TO;
    setGradientState({ from: FROM, to: toValue });
  }, []);

  return (
    <CommunityGradientContext.Provider value={{ from, to, setGradient }}>
      {children}
    </CommunityGradientContext.Provider>
  );
};

export function useCommunityGradient() {
  return useContext(CommunityGradientContext);
}
