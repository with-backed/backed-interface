import styles from './AdvancedSearch.module.css';
import { useCallback } from 'react';
import { Button } from 'components/Button';
import { LoanStatus } from 'types/generated/graphql/nftLoans';

type LoanStatusButtonsProps = {
  label: string;
  statuses: LoanStatus[];
  setStatuses: React.Dispatch<React.SetStateAction<LoanStatus[]>>;
};

const labelToEnum: { [key: string]: LoanStatus } = {
  'Awaiting Lender': LoanStatus.AwaitingLender,
  Active: LoanStatus.Active,
  Repaid: LoanStatus.Repaid,
  Seized: LoanStatus.Seized,
};

export default function LoanStatusButtons({
  label,
  statuses,
  setStatuses,
}: LoanStatusButtonsProps) {
  const handleStatusSelected = useCallback(
    (status: LoanStatus) => {
      if (statuses.includes(status)) {
        setStatuses((prevStatuses) => prevStatuses.filter((s) => s != status));
      } else {
        setStatuses((prevStatuses) => [...prevStatuses, status]);
      }
    },
    [statuses, setStatuses],
  );

  return (
    <div className={styles.inputWrapper}>
      <span>{label}</span>
      <div className={`${styles.loanStatusButtons}`}>
        {Object.keys(labelToEnum).map((l) => (
          <div className={styles.buttonWrapper} key={l}>
            <Button
              kind={`${
                statuses.includes(labelToEnum[l]) ? 'primary' : 'white'
              }`}
              onClick={() => handleStatusSelected(labelToEnum[l])}>
              {l}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
