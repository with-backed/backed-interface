import { TransactionButton } from 'components/Button';
import { FormErrors } from 'components/FormErrors';
import { Input } from 'components/Input';
import { Select } from 'components/Select';
import { ethers } from 'ethers';
import { Field, Formik } from 'formik';
import { useWeb3 } from 'hooks/useWeb3';
import {
  jsonRpcERC20Contract,
  jsonRpcLoanFacilitator,
  web3LoanFacilitator,
} from 'lib/contracts';
import { getLoanAssets, LoanAsset } from 'lib/loanAssets';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  FocusEvent,
  ChangeEvent,
} from 'react';
import * as Yup from 'yup';
import styles from './CreatePageHeader.module.css';

const SECONDS_IN_A_DAY = 60 * 60 * 24;
const SECONDS_IN_A_YEAR = 31_536_000;
const INTEREST_RATE_PERCENT_DECIMALS = 8;
const MIN_RATE = 1 / 10 ** INTEREST_RATE_PERCENT_DECIMALS;

type CreatePageFormProps = {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
  disabled: boolean;
  onApproved: () => void;
  onBlur: (filled: boolean) => void;
  onError: () => void;
  onFocus: (
    type: 'DENOMINATION' | 'LOAN_AMOUNT' | 'DURATION' | 'INTEREST_RATE',
  ) => void;
  onSubmit: () => void;
  setDenomination: (denomination: LoanAsset | null) => void;
  setDuration: (rate: number | null) => void;
  setInterestRate: (rate: number | null) => void;
  setLoanAmount: (rate: number | null) => void;
};

export function CreatePageForm({
  collateralAddress,
  collateralTokenID,
  disabled,
  onApproved,
  onBlur,
  onError,
  onFocus,
  onSubmit,
  setDenomination,
  setDuration,
  setInterestRate,
  setLoanAmount,
}: CreatePageFormProps) {
  const { account } = useWeb3();
  const buttonText = useMemo(() => 'Mint Borrower Ticket', []);
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);

  const wait = useCallback(async () => {
    const contract = jsonRpcLoanFacilitator();
    const filter = contract.filters.CreateLoan(null, account, null, null, null);
    contract.once(filter, (id) => {
      onApproved();
      setWaitingForTx(false);
      window.location.assign(`/loans/${id.toString()}`);
    });
  }, [account, onApproved]);

  const mint = useCallback(
    async ({
      loanAssetContractAddress,
      loanAmount,
      interestRate,
      duration,
    }) => {
      const assetContract = jsonRpcERC20Contract(
        loanAssetContractAddress.value,
      );
      const loanAssetDecimals = await assetContract.decimals();
      const durationInSeconds = Math.ceil(duration * SECONDS_IN_A_DAY);
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(interestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_A_YEAR);

      const contract = web3LoanFacilitator();
      onSubmit();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        interestRatePerSecond,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        loanAssetContractAddress.value,
        durationInSeconds,
        // If they've gotten this far, they must have an account.
        account!,
      );

      setTxHash(t.hash);
      setWaitingForTx(true);
      t.wait()
        .then(() => {
          wait();
          setWaitingForTx(true);
        })
        .catch((err) => {
          setWaitingForTx(false);
          onError();
          console.error(err);
        });
    },
    [account, collateralAddress, collateralTokenID, onError, onSubmit, wait],
  );

  const loadAssets = useCallback(async () => {
    const assets = await getLoanAssets();
    setLoanAssetOptions(assets);
  }, []);

  const initialLoanAssetContractAddress = useMemo(() => {
    if (loanAssetOptions.length > 0) {
      const { address, symbol } = loanAssetOptions[0];
      return { value: address, label: symbol };
    }
    return undefined;
  }, [loanAssetOptions]);
  const [loanAssetContractAddress, setLoanAssetContractAddress] = useState(
    initialLoanAssetContractAddress,
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onBlur(event.target.value.length > 0);
    },
    [onBlur],
  );

  const handleSelectBlur = useCallback(() => {
    onBlur(!!loanAssetContractAddress);
  }, [loanAssetContractAddress, onBlur]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <Formik
      initialValues={{
        loanAssetContractAddress: initialLoanAssetContractAddress,
        loanAmount: undefined,
        interestRate: undefined,
        duration: undefined,
      }}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
      validationSchema={Yup.object({
        loanAssetContractAddress: Yup.object({
          value: Yup.string(),
          address: Yup.string(),
        }),
        loanAmount: Yup.number().moreThan(
          0,
          'Loan amount must be greater than zero.',
        ),
        interestRate: Yup.number().min(
          MIN_RATE,
          `Interest rate must be greater than the minimum value of ${MIN_RATE}.`,
        ),
        duration: Yup.number().moreThan(
          0,
          'Duration must be longer than 0 days.',
        ),
      })}
      isInitialValid={false}
      onSubmit={mint}>
      {(formik) => (
        <form
          className={styles.form}
          onSubmit={formik.handleSubmit}
          id="form"
          autoComplete="off">
          <label htmlFor="loanAssetContractAddress">
            <span>Loan Denomination</span>
            <Field
              id="denomination"
              name="loanAssetContractAddress"
              as={Select}
              options={loanAssetOptions.map(({ symbol, address }) => ({
                value: address,
                label: symbol,
              }))}
              onChange={(option: { [key: string]: string }) => {
                setDenomination({
                  symbol: option.label,
                  address: option.value,
                });
                setLoanAssetContractAddress({
                  value: option.value,
                  label: option.label,
                });
                formik.setFieldValue('loanAssetContractAddress', option);
              }}
              onFocus={() => onFocus('DENOMINATION')}
              onBlur={handleSelectBlur}
              isDisabled={disabled}
            />
          </label>

          <label htmlFor="loanAmount">
            <span>Minimum Loan Amount</span>
            <Field
              id="loanAmount"
              name="loanAmount"
              type="number"
              placeholder="0"
              as={Input}
              color="dark"
              unit={formik.values.loanAssetContractAddress?.label}
              onFocus={() => onFocus('LOAN_AMOUNT')}
              onBlur={handleBlur}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target;
                const parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) {
                  setLoanAmount(null);
                } else {
                  setLoanAmount(parsedValue);
                }
                formik.handleChange(event);
              }}
            />
          </label>

          <label htmlFor="duration">
            <span>Minimum Duration</span>
            <Field
              id="duration"
              name="duration"
              type="number"
              placeholder="0"
              as={Input}
              color="dark"
              unit="Days"
              onFocus={() => onFocus('DURATION')}
              onBlur={handleBlur}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target;
                const parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) {
                  setDuration(null);
                } else {
                  setDuration(parsedValue);
                }
                formik.handleChange(event);
              }}
            />
          </label>

          <label htmlFor="interestRate">
            <span>Maximum Interest Rate</span>
            <Field
              id="interestRate"
              name="interestRate"
              type="number"
              placeholder={`0`}
              as={Input}
              color="dark"
              unit="%"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target;
                const parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) {
                  setInterestRate(null);
                } else {
                  setInterestRate(parsedValue);
                }
                formik.handleChange(event);
              }}
              onFocus={() => onFocus('INTEREST_RATE')}
              onBlur={handleBlur}
              disabled={disabled}
            />
          </label>

          <TransactionButton
            id="mintBorrowerTicket"
            text={buttonText}
            type="submit"
            txHash={txHash}
            isPending={waitingForTx}
            disabled={disabled || !formik.isValid}
          />

          <FormErrors errors={Object.values(formik.errors)} />
        </form>
      )}
    </Formik>
  );
}
