import { Button } from 'components/Button';
import { GridListSelector } from 'components/GridListSelector';
import styles from './AdvancedSearch.module.css';
import SortDropdown, { SortOptionValue } from './SortDropdown';

type SearchHeaderProps = {
  handleViewChange: (checked: boolean) => void;
  setSelectedSort: (sort: SortOptionValue) => void;
  showSearch: boolean;
  setShowSearch: (showSearch: boolean) => void;
};

export function SearchHeader({
  handleViewChange,
  setSelectedSort,
  showSearch,
  setShowSearch,
}: SearchHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.searchButton}>
        <GridListSelector handleChange={handleViewChange} />
        <Button
          kind={`${showSearch ? 'secondary' : 'primary-dark-bg'}`}
          onClick={() => setShowSearch(!showSearch)}>
          &#x1F50D; Search
        </Button>
      </div>
      <SortDropdown setSelectedSort={setSelectedSort} />
    </div>
  );
}
