import { Button } from 'components/Button';
import { Loan_OrderBy } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';
import SortDropdown from './SortDropdown';

type SearchHeaderProps = {
  setSelectedSort: (sort: Loan_OrderBy) => void;
  showSearch: boolean;
  setShowSearch: (showSearch: boolean) => void;
};

export function SearchHeader({
  setSelectedSort,
  showSearch,
  setShowSearch,
}: SearchHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.searchButton}>
        <Button
          kind={`${showSearch ? 'secondary' : 'primary'}`}
          onClick={() => setShowSearch(!showSearch)}>
          &#x1F50D; Search
        </Button>
      </div>
      <SortDropdown setSelectedSort={setSelectedSort} />
    </div>
  );
}
