import { TransactionButton } from 'components/Button';
import { Form } from 'components/Form';
import { Input } from 'components/Input';
import { Select } from 'components/Select';
import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import {
  INTEREST_RATE_PERCENT_DECIMALS,
  SECONDS_IN_A_DAY,
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
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = form;
  const { account, library } = useWeb3();
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
      loanAmount,
      interestRate,
      duration,
      denomination,
    }: CreateFormData) => {
      const parsedInterestRate = parseFloat(interestRate);
      const parsedDuration = parseFloat(duration);
      const assetContract = jsonRpcERC20Contract(denomination.address);
      const loanAssetDecimals = await assetContract.decimals();
      const durationInSeconds = Math.ceil(parsedDuration * SECONDS_IN_A_DAY);
      const annualInterestRate = ethers.BigNumber.from(
        Math.floor(
          parsedInterestRate * 10 ** (INTEREST_RATE_PERCENT_DECIMALS - 2),
        ),
      );

      console.log(`parsedInterestRate ${parsedInterestRate}`);
      console.log(`rate ${annualInterestRate}`);

      const contract = web3LoanFacilitator(library!);
      onSubmit();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        annualInterestRate,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        denomination.address,
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

  const handleSelectBlur = useCallback(
    (filled: boolean) => onBlur(filled),
    [onBlur],
  );

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <Form onSubmit={handleSubmit(mint)} id="form" autoComplete="off">
      <label htmlFor="loanAsset">
        <span>Loan Denomination</span>
        <Controller
          control={control}
          name="denomination"
          render={({ field: { onChange, onBlur, value } }) => (
            <Select
              id="denomination"
              onChange={onChange}
              onBlur={() => {
                handleSelectBlur(!!watchAllFields.denomination);
                onBlur();
              }}
              onFocus={() => onFocus('DENOMINATION')}
              options={
                loanAssetOptions.map((asset) => ({
                  label: asset.symbol,
                  ...asset,
                })) as any
              }
              aria-invalid={!!errors.denomination}
              value={value}
            />
          )}
        />
      </label>

      <label htmlFor="loanAmount">
        <span>Minimum Loan Amount</span>
        <Input
          id="loanAmount"
          placeholder="0"
          type="text"
          color="dark"
          unit={watchAllFields.denomination?.symbol}
          disabled={disabled}
          onFocus={() => onFocus('LOAN_AMOUNT')}
          aria-invalid={!!errors.loanAmount}
          {...register('loanAmount', { onBlur: handleBlur })}
        />
      </label>

      <label htmlFor="duration">
        <span>Minimum Duration</span>
        <Input
          id="duration"
          placeholder="0"
          type="text"
          color="dark"
          unit="Days"
          disabled={disabled}
          onFocus={() => onFocus('DURATION')}
          aria-invalid={!!errors.duration}
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
          aria-invalid={!!errors.interestRate}
          {...register('interestRate', { onBlur: handleBlur })}
        />
      </label>

      <TransactionButton
        id="mintBorrowerTicket"
        text={buttonText}
        type="submit"
        txHash={txHash}
        isPending={waitingForTx}
        disabled={disabled || Object.keys(errors).length > 0}
      />
    </Form>
  );
}
