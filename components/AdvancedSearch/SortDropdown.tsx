import { Select } from 'components/Select';
import { Loan_OrderBy, OrderDirection } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setSelectedSort: (val: SortOptionValue) => void;
};

export type SortOptionValue = {
  field: Loan_OrderBy;
  direction: OrderDirection;
};

export type SortOptionInput = {
  value: SortOptionValue;
  label: string;
};

const sortOptions: SortOptionInput[] = [
  {
    value: {
      field: Loan_OrderBy.CreatedAtTimestamp,
      direction: OrderDirection.Desc,
    },
    label: 'First Created',
  },
  {
    value: {
      field: Loan_OrderBy.PerSecondInterestRate,
      direction: OrderDirection.Desc,
    },
    label: 'Highest % APY',
  },
  {
    value: {
      field: Loan_OrderBy.PerSecondInterestRate,
      direction: OrderDirection.Asc,
    },
    label: 'Lowest % APY',
  },
  {
    value: {
      field: Loan_OrderBy.LoanAmount,
      direction: OrderDirection.Desc,
    },
    label: 'Biggest Loan',
  },
  {
    value: {
      field: Loan_OrderBy.LoanAmount,
      direction: OrderDirection.Asc,
    },
    label: 'Smallest Loan',
  },
  {
    value: {
      field: Loan_OrderBy.DurationSeconds,
      direction: OrderDirection.Asc,
    },
    label: 'Shortest Duration',
  },
  {
    value: {
      field: Loan_OrderBy.DurationSeconds,
      direction: OrderDirection.Desc,
    },
    label: 'Longest Duration',
  },
];

export default function SortDropdown({ setSelectedSort }: SortDropdownProps) {
  return (
    <div className={styles.sortDropdown}>
      <div>Sort by</div>
      <div className={styles.sortSelectWrapper}>
        <Select
          onChange={(option: any) => setSelectedSort(option.value)}
          options={sortOptions}
          color="dark"
        />
      </div>
    </div>
  );
}
