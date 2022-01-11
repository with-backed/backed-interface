import { Button } from 'components/Button';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { DEFAULT_ASSET_DECIMALS } from 'lib/loanAssets';
import {
  LoanAmountInputType,
  searchLoans,
} from 'lib/loans/subgraph/subgraphLoans';
import { useIsMount } from 'lib/useIsMount';
import { useEffect, useState } from 'react';
import {
  Loan,
  LoanStatus,
  Loan_OrderBy,
} from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';
import CollateralSearchInput from './CollateralInput';
import LoanNumericInput from './LoanNumericInput';
import LoanStatusButtons from './LoanStatusButtons';
import SearchTextInput from './SearchTextInput';
import SortDropdown from './SortDropdown';

type AdvancedSearchProps = {
  handleSearchFinished: (loans: Loan[]) => void;
};

const BYTES_INVALID_ERROR = "Oops, that doesn't look like a valid address";
const areBytesInvalid = (bytes: string[]) =>
  bytes.filter((b) => b.length % 2 !== 0).length > 0;

export function AdvancedSearch({ handleSearchFinished }: AdvancedSearchProps) {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<Loan_OrderBy>(
    Loan_OrderBy.CreatedAtTimestamp,
  );
  const [statuses, setStatuses] = useState<LoanStatus[]>([
    LoanStatus.AwaitingLender,
    LoanStatus.Active,
  ]);

  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [collectionName, setCollectionName] = useState<string>('');
  const [loanToken, setLoanToken] = useState<string>('');
  const [borrowerAddress, setBorrowerAddress] = useState<string>('');
  const [lenderAddress, setLenderAddress] = useState<string>('');

  // based on results of search, set loanAssetDecimal so we know how to parse loanAmountMin and loanAmountMax
  const [loanAssetDecimal, setLoanAssetDecimal] = useState<number>(
    DEFAULT_ASSET_DECIMALS,
  );

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

  const isMount = useIsMount();

  const loanTokenSearchInvalid =
    (!!loanAmountMin.nominal || !!loanAmountMax.nominal) && !loanToken;
  const bytesSearchInvalid = areBytesInvalid([
    borrowerAddress,
    lenderAddress,
    collectionAddress,
  ]);

  useEffect(() => {
    async function triggerSearch() {
      if (loanTokenSearchInvalid || bytesSearchInvalid) return;
      const results = await searchLoans(
        statuses,
        collectionAddress,
        collectionName,
        loanToken,
        borrowerAddress,
        lenderAddress,
        loanAmountMin,
        loanAmountMax,
        loanInterestMin,
        loanInterestMax,
        loanDurationMin,
        loanDurationMax,
        selectedSort,
      );
      handleSearchFinished(results);
      setLoanAssetDecimal(
        results[0]?.loanAssetDecimal || DEFAULT_ASSET_DECIMALS,
      );
    }
    if (!isMount) triggerSearch();
  }, [
    statuses,
    collectionAddress,
    collectionName,
    handleSearchFinished,
    loanToken,
    borrowerAddress,
    lenderAddress,
    loanAmountMin,
    loanAmountMax,
    loanInterestMin,
    loanInterestMax,
    loanDurationMin,
    loanDurationMax,
    selectedSort,
    isMount,
    loanTokenSearchInvalid,
    bytesSearchInvalid,
  ]);

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.header}>
        <div className={styles.searchButton}>
          <Button
            kind={`${showSearch ? 'secondary' : 'primary'}`}
            onClick={() => setShowSearch(!showSearch)}>
            &#x1F50D; Search
          </Button>
        </div>

        <SortDropdown setSelectedSort={setSelectedSort} />
      </div>

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
              error={
                areBytesInvalid([collectionAddress])
                  ? BYTES_INVALID_ERROR
                  : undefined
              }
            />
          </div>
          <div
            className={`${
              showSearch
                ? styles.inputGroupWrapperOpen
                : styles.inputGroupWrapperClosed
            }`}>
            <SearchTextInput
              label="Loan Token"
              placeholder="Enter symbol"
              setTextValue={setLoanToken}
              transformer={(old: string) => old.toUpperCase()}
            />
          </div>
          <div
            className={`${
              showSearch
                ? styles.inputGroupWrapperOpen
                : styles.inputGroupWrapperClosed
            }`}>
            <SearchTextInput
              label="Borrower"
              placeholder="Enter 0x..."
              setTextValue={setBorrowerAddress}
              error={
                areBytesInvalid([borrowerAddress])
                  ? BYTES_INVALID_ERROR
                  : undefined
              }
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
              placeholder="Enter 0x..."
              setTextValue={setLenderAddress}
              error={
                areBytesInvalid([lenderAddress])
                  ? BYTES_INVALID_ERROR
                  : undefined
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
              label="Loan Amount"
              setMin={(nominal: number) =>
                setLoanAmountMin({ loanAssetDecimal, nominal })
              }
              setMax={(nominal: number) =>
                setLoanAmountMax({ loanAssetDecimal, nominal })
              }
              error={
                loanTokenSearchInvalid
                  ? 'First, enter a symbol for the loan token'
                  : undefined
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
              setMin={setLoanDurationMin}
              setMax={setLoanDurationMax}
            />
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}
