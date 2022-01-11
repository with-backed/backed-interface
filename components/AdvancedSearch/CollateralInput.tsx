import styles from './AdvancedSearch.module.css';
import { Input } from 'components/Input';
import { ChangeEvent, useCallback } from 'react';

type CollateralSearchInputProps = {
  collectionAddress: string;
  collectionName: string;
  setCollectionAddress: (address: string) => void;
  setCollectionName: (name: string) => void;
};

export default function CollateralSearchInput({
  setCollectionAddress,
  setCollectionName,
}: CollateralSearchInputProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.trim();

      if (newValue.length < 3) {
        setCollectionName('');
        setCollectionAddress('');
      } else {
        if (newValue.substring(0, 2) == '0x') {
          setCollectionAddress(newValue);
          setCollectionName('');
        } else {
          setCollectionName(newValue.toLowerCase());
          setCollectionAddress('');
        }
      }
    },
    [setCollectionAddress, setCollectionName],
  );

  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputLabel}>Collection</div>
      <div className={styles.inputs}>
        <label>
          <Input onChange={handleChange} placeholder="Enter collection" />
        </label>
      </div>
    </div>
  );
}
