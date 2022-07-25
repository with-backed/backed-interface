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
  'Gold Chain Contributor': '#ffcf5314',
  'Gold Key': '#F8D27014',
  'Preserver of Wisdom': '#FFB65314',
  'Pink Protocol Lei': '#FF5CDB14',
  'Purple Community Scarf': '#5653ff14',
  'Alpha-Snake': '#86A36214',
  'Super Chain Contributor': '#ffcf5314',
  'Super Protocol Lei': '#FF5CDB14',
  'Super Community Scarf': '#5653ff14',
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
