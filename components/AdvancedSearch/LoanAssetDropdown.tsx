import { Select } from 'components/Select';
import { getLoanAssets, LoanAsset } from 'lib/loanAssets';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    <label>
      <span>Loan Asset</span>
      <div>
        <Select
          onChange={(option: any) => setSelectedAsset(option.label)}
          options={loanAssetOptions.map(({ symbol, address }) => ({
            value: address,
            label: symbol,
          }))}
        />
      </div>
    </label>
  );
}
