import { Select } from 'components/Select';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setSelectedSort: (val: string) => void;
};

const sortOptions = [
  { value: 'createdAtTimestamp', label: 'Recent Activity' },
  { value: 'perSecondInterestRate', label: 'APY' },
  { value: 'loanAmount', label: 'Loan Amount' },
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
