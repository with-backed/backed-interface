import { Select } from 'components/Select';
import { getLoanAssets, LoanAsset } from 'lib/loanAssets';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './AdvancedSearch.module.css';

type LoanAssetDropdownProps = {
  setSelectedAsset: (val: string) => void;
};

export default function LoanAssetDropdown({
  setSelectedAsset,
}: LoanAssetDropdownProps) {
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);
  const loadAssets = useCallback(async () => {
    const assets = await getLoanAssets();
    setLoanAssetOptions(assets);
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <div className={`${styles.inputWrapper} ${styles.loanAssetDropdown}`}>
      <span>Loan Token</span>
      <div className={styles.inputGroup}>
        <Select
          isClearable
          onChange={(option: any) => setSelectedAsset(option?.label || '')}
          options={loanAssetOptions.map(({ symbol, address }) => ({
            value: address,
            label: symbol,
          }))}
          color="light"
        />
      </div>
    </div>
  );
}
