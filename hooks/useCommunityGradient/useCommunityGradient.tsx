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
  'Gold Chain Contributor': '#ffcf531A',
  'Gold Key': '#F8D2701A',
  'Preserver of Wisdom': '#FFB6531A',
  'Pink Protocol Lei': '#FF5CDB1A',
  'Purple Community Scarf': '#5653ff1A',
  'Alpha-Snake': '#86A3621A',
  'Super Chain Contributor': '#ffcf531A',
  'Super Protocol Lei': '#FF5CDB1A',
  'Super Community Scarf': '#5653ff1A',
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
