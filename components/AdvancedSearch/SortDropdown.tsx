import { Select } from 'components/Select';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setSelectedSort: (val: string) => void;
};

const sortOptions: { [key: string]: string } = {
  createdAtTimestamp: 'Recent Activity',
  perSecondInterestRate: 'APY',
  loanAmount: 'Loan Amount',
};

export default function SortDropdown({ setSelectedSort }: SortDropdownProps) {
  return (
    <div className={styles.sortDropdown}>
      <div>Sort by</div>
      <Select onChange={(event) => setSelectedSort(event.target.value)}>
        {Object.keys(sortOptions).map((option) => (
          <option value={option} key={option}>
            {sortOptions[option]}
          </option>
        ))}
      </Select>
    </div>
  );
}
