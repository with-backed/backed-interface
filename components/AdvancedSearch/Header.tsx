import { Button } from 'components/Button';
import { GridListSelector } from 'components/GridListSelector';
import { useCallback } from 'react';
import { LoanStatus } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';
import LendabilityDropdown from './LendabilityDropdown';
import SortDropdown, { SortOptionValue } from './SortDropdown';

type SearchHeaderProps = {
  handleViewChange: (checked: boolean) => void;
  setSelectedSort: (sort: SortOptionValue) => void;
  setStatuses: React.Dispatch<React.SetStateAction<LoanStatus[]>>;
  showSearch: boolean;
  setShowSearch: (showSearch: boolean) => void;
};

export function SearchHeader({
  handleViewChange,
  setSelectedSort,
  setStatuses,
  showSearch,
  setShowSearch,
}: SearchHeaderProps) {
  const toggleShowSearch = useCallback(() => {
    const message = showSearch
      ? 'Advanced search closed'
      : 'Advanced search opened';
    setShowSearch(!showSearch);
    window.pirsch(message, {});
  }, [setShowSearch, showSearch]);
  return (
    <div className={styles.header}>
      <div className={styles.searchButton}>
        <GridListSelector handleChange={handleViewChange} />
        <Button
          kind={showSearch ? 'highlight' : 'quaternary'}
          onClick={toggleShowSearch}>
          &#x1F50D; Search
        </Button>
      </div>
      <LendabilityDropdown setStatuses={setStatuses} />
      <SortDropdown setSelectedSort={setSelectedSort} />
    </div>
  );
}
