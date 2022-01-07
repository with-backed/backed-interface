import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent } from 'react';

type LoanTokenInputProps = {
  handleTextInputChanged: (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
    setValue: (val: string) => void,
  ) => void;
  loanToken: string;
  setLoanToken: (token: string) => void;
};

export default function LoanTokenInput({
  handleTextInputChanged,
  loanToken,
  setLoanToken,
}: LoanTokenInputProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>Loan Token</div>
      <div className={styles.inputs}>
        <Input
          onChange={(event) =>
            handleTextInputChanged(event, loanToken, setLoanToken)
          }
          placeholder="Enter symbol"
        />
      </div>
    </div>
  );
}
