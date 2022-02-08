import { Select } from 'components/Select';
import { Loan_OrderBy } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setSelectedSort: (val: Loan_OrderBy) => void;
};

const sortOptions = [
  { value: Loan_OrderBy.CreatedAtTimestamp, label: 'Recent Activity' },
  { value: Loan_OrderBy.PerSecondInterestRate, label: 'APY' },
  { value: Loan_OrderBy.LoanAmount, label: 'Loan Amount' },
];

export default function SortDropdown({ setSelectedSort }: SortDropdownProps) {
  return (
    <div className={styles.sortDropdown}>
      <div>Sort by</div>
      <div className={styles.sortSelectWrapper}>
        <Select
          onChange={(option: any) => setSelectedSort(option.value)}
          options={sortOptions}
          color="light"
        />
      </div>
    </div>
  );
}
