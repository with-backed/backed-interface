import { Select } from 'components/Select';
import {
  LoanStatus,
  Loan_OrderBy,
  OrderDirection,
} from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';

type SortDropdownProps = {
  setStatuses: React.Dispatch<React.SetStateAction<LoanStatus[]>>;
};

export type SortOptionValue = {
  field: Loan_OrderBy;
  direction: OrderDirection;
};

export type LendabilityOptionInput = {
  value: LoanStatus[];
  label: string;
};

const sortOptions: LendabilityOptionInput[] = [
  {
    value: [LoanStatus.AwaitingLender, LoanStatus.Active],
    label: 'Available to Lend',
  },
  {
    value: [LoanStatus.Repaid],
    label: 'Repaid and closed',
  },
  {
    value: [LoanStatus.Seized],
    label: 'Seized and closed',
  },
];

export default function LendabilityDropdown({
  setStatuses,
}: SortDropdownProps) {
  return (
    <div className={styles.sortDropdown}>
      <div className={styles.sortSelectWrapper}>
        <label className={styles['select-label']}>
          Filter
          <Select
            onChange={(option: any) => setStatuses(option.value)}
            options={sortOptions}
            color="dark"
          />
        </label>
      </div>
    </div>
  );
}
