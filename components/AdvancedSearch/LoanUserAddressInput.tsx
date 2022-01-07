import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent } from 'react';

type LoanUserAddressInputProps = {
  handleTextInputChanged: (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
    setValue: (val: string) => void,
  ) => void;
  address: string;
  setAddress: (token: string) => void;
};

export default function LoanUserAddressInput({
  handleTextInputChanged,
  address,
  setAddress,
}: LoanUserAddressInputProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>Address</div>
      <div className={styles.inputs}>
        <Input
          onChange={(event) =>
            handleTextInputChanged(event, address, setAddress)
          }
          placeholder="Enter 0x..."
        />
      </div>
    </div>
  );
}
