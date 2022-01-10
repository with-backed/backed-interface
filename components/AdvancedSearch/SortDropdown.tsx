import { Select } from 'components/Select';
import { SearchQuerySort } from 'lib/loans/subgraph/subgraphLoans';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setSelectedSort: (val: SearchQuerySort) => void;
};

const sortOptions = [
  { value: SearchQuerySort.CreatedAtTimestamp, label: 'Recent Activity' },
  { value: SearchQuerySort.PerSecondInterestRate, label: 'APY' },
  { value: SearchQuerySort.LoanAmount, label: 'Loan Amount' },
];

export default function SortDropdown({ setSelectedSort }: SortDropdownProps) {
  return (
    <div className={styles.sortDropdown}>
      <div>Sort by</div>
      <Select
        onChange={(option: any) => setSelectedSort(option.value)}
        options={sortOptions}
      />
    </div>
  );
}
