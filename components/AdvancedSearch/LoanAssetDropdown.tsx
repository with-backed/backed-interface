import { Select } from 'components/Select';
import { useConfig } from 'hooks/useConfig';
import { LoanAsset } from 'lib/loanAssets';
import { useCallback, useEffect, useState } from 'react';
import styles from './AdvancedSearch.module.css';

type LoanAssetDropdownProps = {
  setSelectedAsset: (val: string) => void;
};

export default function LoanAssetDropdown({
  setSelectedAsset,
}: LoanAssetDropdownProps) {
  const { network } = useConfig();
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);
  const loadAssets = useCallback(async () => {
    const response = await fetch(`/api/network/${network}/loanAssets`);
    const tokens: LoanAsset[] | null = await response.json();
    if (tokens) {
      setLoanAssetOptions(tokens);
    }
  }, [network]);

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
