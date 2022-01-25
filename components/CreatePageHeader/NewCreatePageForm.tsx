import { TransactionButton } from 'components/Button';
import { Input } from 'components/Input';
import { Select } from 'components/Select';
import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import {
  INTEREST_RATE_PERCENT_DECIMALS,
  SECONDS_IN_A_DAY,
  SECONDS_IN_A_YEAR,
} from 'lib/constants';
import {
  jsonRpcERC20Contract,
  jsonRpcLoanFacilitator,
  web3LoanFacilitator,
} from 'lib/contracts';
import { getLoanAssets, LoanAsset } from 'lib/loanAssets';
import React, {
  FocusEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { CreateFormData } from './CreateFormData';
import styles from './CreatePageHeader.module.css';

type CreatePageFormProps = {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
  disabled: boolean;
  form: UseFormReturn<CreateFormData, object>;
  onApproved: () => void;
  onBlur: (filled: boolean) => void;
  onError: () => void;
  onFocus: (
    type: 'DENOMINATION' | 'LOAN_AMOUNT' | 'DURATION' | 'INTEREST_RATE',
  ) => void;
  onSubmit: () => void;
};

export function CreatePageForm({
  collateralAddress,
  collateralTokenID,
  disabled,
  form,
  onApproved,
  onBlur,
  onError,
  onFocus,
  onSubmit,
}: CreatePageFormProps) {
  const { control, handleSubmit, register, watch } = form;
  const { account } = useWeb3();
  const buttonText = useMemo(() => 'Mint Borrower Ticket', []);
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);

  const watchAllFields = watch();

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
      loanAsset,
      loanAmount,
      interestRate,
      duration,
    }: CreateFormData) => {
      const parsedInterestRate = parseFloat(interestRate);
      const parsedDuration = parseFloat(duration);
      const assetContract = jsonRpcERC20Contract(loanAsset.address);
      const loanAssetDecimals = await assetContract.decimals();
      const durationInSeconds = Math.ceil(parsedDuration * SECONDS_IN_A_DAY);
      const interestRatePerSecond = ethers.BigNumber.from(
        Math.floor(parsedInterestRate * 10 ** INTEREST_RATE_PERCENT_DECIMALS),
      ).div(SECONDS_IN_A_YEAR);

      const contract = web3LoanFacilitator();
      onSubmit();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        interestRatePerSecond,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        loanAsset.address,
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

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onBlur(event.target.value.length > 0);
    },
    [onBlur],
  );

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  console.log({ loanAssetOptions });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(mint)}
      id="form"
      autoComplete="off">
      <label htmlFor="loanAsset">
        <span>Loan Denomination</span>
        <Controller
          name="loanAsset"
          control={control}
          render={({ field: { onBlur, ...field } }) => (
            <Select
              id="denomination"
              isDisabled={disabled}
              options={loanAssetOptions.map((asset) => ({
                ...asset,
                label: asset.symbol,
              }))}
              onFocus={() => onFocus('DENOMINATION')}
              onBlur={(event) => {
                handleBlur(event);
                onBlur();
              }}
              {...field}
            />
          )}
        />
      </label>

      <label htmlFor="loanAmount">
        <span>Minimum Loan Amount</span>
        <Input
          id="loanAmount"
          placeholder="0"
          type="number"
          color="dark"
          unit={watchAllFields.loanAsset?.symbol}
          disabled={disabled}
          onFocus={() => onFocus('LOAN_AMOUNT')}
          {...register('loanAmount', { onBlur: handleBlur })}
        />
      </label>

      <label htmlFor="duration">
        <span>Minimum Duration</span>
        <Input
          id="duration"
          placeholder="0"
          type="number"
          color="dark"
          unit="Days"
          disabled={disabled}
          onFocus={() => onFocus('DURATION')}
          {...register('duration', { onBlur: handleBlur })}
        />
      </label>

      <label htmlFor="interestRate">
        <span>Maximum Interest Rate</span>
        <Input
          id="interestRate"
          type="text"
          placeholder={`0`}
          color="dark"
          unit="%"
          onFocus={() => onFocus('INTEREST_RATE')}
          disabled={disabled}
          {...register('interestRate', { onBlur: handleBlur })}
        />
      </label>

      <TransactionButton
        id="mintBorrowerTicket"
        text={buttonText}
        type="submit"
        txHash={txHash}
        isPending={waitingForTx}
        disabled={disabled}
      />
    </form>
  );
}
