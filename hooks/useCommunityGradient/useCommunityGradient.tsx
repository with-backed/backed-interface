import {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useState,
} from 'react';

const FROM = '#ffffff';
const DEFAULT_TO = '#f6f3fa';

const accessoryToValue: Record<string, string> = {
  'Gold Chain Contributor': '#ffcf53',
  'Gold Key': '#F8D270',
  'Preserver of Wisdom': '#FFB653',
  'Pink Protocol Lei': '#FF5CDB',
  'Purple Community Scarf': '#5653ff',
  'Alpha-Snake': '#86A362',
  'Super Chain Contributor': '#ffcf53',
  'Super Protocol Lei': '#FF5CDB',
  'Super Community Scarf': '#5653ff',
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
