import { Button } from 'components/Button';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { searchLoans, SearchQuerySort } from 'lib/loans/subgraph/subgraphLoans';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Loan, LoanStatus } from 'types/generated/graphql/nftLoans';
import styles from './AdvancedSearch.module.css';
import CollateralSearchInput from './CollateralInput';
import LoanNumericInput from './LoanNumericInput';
import LoanStatusButtons from './LoanStatusButtons';
import LoanTokenInput from './LoanTokenInput';
import LoanUserAddressInput from './LoanUserAddressInput';
import SearchTextInput from './SearchTextInput';
import SortDropdown from './SortDropdown';

type AdvancedSearchProps = {
  handleSearchFinished: (loans: Loan[]) => void;
};

export const useIsMount = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

export function AdvancedSearch({ handleSearchFinished }: AdvancedSearchProps) {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<SearchQuerySort>(
    SearchQuerySort.CreatedAtTimestamp,
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

  const [loanAmountMin, setLoanAmountMin] = useState<number>(0);
  const [loanAmountMax, setLoanAmountMax] = useState<number>(0);
  const [loanInterestMin, setLoanInterestMin] = useState<number>(0);
  const [loanInterestMax, setLoanInterestMax] = useState<number>(0);
  const [loanDurationMin, setLoanDurationMin] = useState<number>(0);
  const [loanDurationMax, setLoanDurationMax] = useState<number>(0);

  const isMount = useIsMount();

  useEffect(() => {
    async function triggerSearch() {
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
              setMin={setLoanAmountMin}
              setMax={setLoanAmountMax}
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
