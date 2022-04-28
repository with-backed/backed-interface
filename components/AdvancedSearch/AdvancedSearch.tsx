import { FormWrapper } from 'components/layouts/FormWrapper';
import { DEFAULT_ASSET_DECIMALS } from 'lib/loanAssets';
import { LoanAmountInputType } from 'lib/loans/subgraph/subgraphLoans';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { LoanStatus } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';
import CollateralSearchInput from './CollateralInput';
import LoanAssetDropdown from './LoanAssetDropdown';
import LoanNumericInput from './LoanNumericInput';
import LoanStatusButtons from './LoanStatusButtons';
import SearchTextInput from './SearchTextInput';

type AdvancedSearchProps = {
  showSearch: boolean;
  setSearchActive: (active: boolean) => void;
  setSearchUrl: (url: string) => void;
  loanAssetDecimalsForSearch?: number; // based on results of search, set loanAssetDecimal so we know how to parse loanAmountMin and loanAmountMax
  statuses: LoanStatus[];
  setStatuses: React.Dispatch<React.SetStateAction<LoanStatus[]>>;
};

const isSearchActive = (statuses: LoanStatus[], ...args: any[]) => {
  return (
    args.filter((arg) => !!arg).length > 0 ||
    !isEqual(statuses.sort(), INITIAL_STATUSES.sort())
  );
};

const INITIAL_STATUSES = [LoanStatus.AwaitingLender, LoanStatus.Active];

export function AdvancedSearch({
  showSearch,
  setSearchActive,
  setSearchUrl,
  statuses,
  setStatuses,
  loanAssetDecimalsForSearch = DEFAULT_ASSET_DECIMALS,
}: AdvancedSearchProps) {
  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [collectionName, setCollectionName] = useState<string>('');
  const [loanAsset, setLoanAsset] = useState<string>('');
  const [borrowerAddress, setBorrowerAddress] = useState<string>('');
  const [lenderAddress, setLenderAddress] = useState<string>('');

  // couple loanAssetDecimal and nominal amount user wants to filter by, and only set them together in lock-step to avoid unnecessary re-renders
  const [loanAmountMin, setLoanAmountMin] = useState<LoanAmountInputType>({
    loanAssetDecimal: DEFAULT_ASSET_DECIMALS,
    nominal: 0,
  });
  const [loanAmountMax, setLoanAmountMax] = useState<LoanAmountInputType>({
    loanAssetDecimal: DEFAULT_ASSET_DECIMALS,
    nominal: 0,
  });
  const [loanInterestMin, setLoanInterestMin] = useState<number>(0);
  const [loanInterestMax, setLoanInterestMax] = useState<number>(0);
  const [loanDurationMin, setLoanDurationMin] = useState<number>(0);
  const [loanDurationMax, setLoanDurationMax] = useState<number>(0);

  useEffect(() => {
    setSearchActive(
      isSearchActive(
        statuses,
        collectionAddress,
        collectionName,
        loanAsset,
        borrowerAddress,
        lenderAddress,
        loanAmountMin.nominal,
        loanAmountMax.nominal,
        loanInterestMin,
        loanInterestMax,
        loanDurationMin,
        loanDurationMax,
      ),
    );
    setSearchUrl(
      `/api/loans/search?statuses=${statuses}&collectionAddress=${collectionAddress}&collectionName=${collectionName}&loanAsset=${loanAsset}&borrowerAddress=${borrowerAddress}&lenderAddress=${lenderAddress}&loanAmountMin=${loanAmountMin.nominal}&loanAmountMinDecimals=${loanAmountMin.loanAssetDecimal}&loanAmountMax=${loanAmountMax.nominal}&loanAmountMaxDecimals=${loanAmountMax.loanAssetDecimal}&loanInterestMin=${loanInterestMin}&loanInterestMax=${loanInterestMax}&loanDurationMin=${loanDurationMin}&loanDurationMax=${loanDurationMax}&`,
    );
  }, [
    statuses,
    collectionAddress,
    collectionName,
    loanAsset,
    borrowerAddress,
    lenderAddress,
    loanAmountMin,
    loanAmountMax,
    loanInterestMin,
    loanInterestMax,
    loanDurationMin,
    loanDurationMax,
    setSearchActive,
    setSearchUrl,
  ]);

  return (
    <div
      className={`${showSearch ? styles.searchOpen : styles.searchClosed} ${
        styles.searchForm
      }`}>
      <FormWrapper>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <LoanStatusButtons
            label="Loan Status"
            statuses={statuses}
            setStatuses={setStatuses}
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <CollateralSearchInput
            collectionAddress={collectionAddress}
            collectionName={collectionName}
            setCollectionAddress={setCollectionAddress}
            setCollectionName={setCollectionName}
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          } ${showSearch ? styles.loanAssetDropdownOpen : ''}`}>
          <LoanAssetDropdown setSelectedAsset={setLoanAsset} />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <SearchTextInput
            label="Borrower"
            isAddress
            placeholder="Enter 0x..."
            setTextValue={setBorrowerAddress}
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <SearchTextInput
            label="Lender"
            isAddress
            placeholder="Enter 0x..."
            setTextValue={setLenderAddress}
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <LoanNumericInput
            label="Loan Amount"
            loanAssetRequired
            setMin={(nominal: number) =>
              setLoanAmountMin({
                loanAssetDecimal: loanAssetDecimalsForSearch,
                nominal,
              })
            }
            loanAsset={loanAsset}
            setMax={(nominal: number) =>
              setLoanAmountMax({
                loanAssetDecimal: loanAssetDecimalsForSearch,
                nominal,
              })
            }
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <LoanNumericInput
            label="Interest Rate"
            loanAssetRequired={false}
            setMin={setLoanInterestMin}
            setMax={setLoanInterestMax}
          />
        </div>
        <div
          className={`${
            showSearch
              ? styles.inputGroupWrapperOpen
              : styles.inputGroupWrapperClosed
          }`}>
          <LoanNumericInput
            label="Duration"
            loanAssetRequired={false}
            setMin={setLoanDurationMin}
            setMax={setLoanDurationMax}
          />
        </div>
      </FormWrapper>
    </div>
  );
}
