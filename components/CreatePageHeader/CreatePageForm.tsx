import { captureException } from '@sentry/nextjs';
import { TransactionButton } from 'components/Button';
import { EtherscanTransactionLink } from 'components/EtherscanLink';
import { Form } from 'components/Form';
import { Input } from 'components/Input';
import { LoanTermsDisclosure } from 'components/LoanTermsDisclosure';
import { Select } from 'components/Select';
import { ethers } from 'ethers';
import { useConfig } from 'hooks/useConfig';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { SupportedNetwork } from 'lib/config';
import {
  INTEREST_RATE_PERCENT_DECIMALS,
  SECONDS_IN_A_DAY,
} from 'lib/constants';
import {
  jsonRpcERC20Contract,
  jsonRpcLoanFacilitator,
  web3LoanFacilitator,
} from 'lib/contracts';
import { LoanAsset } from 'lib/loanAssets';
import React, {
  FocusEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useAccount, useSigner } from 'wagmi';
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
    type:
      | 'DENOMINATION'
      | 'LOAN_AMOUNT'
      | 'DURATION'
      | 'INTEREST_RATE'
      | 'REVIEW'
      | 'ACCEPT_HIGHER_LOAN_AMOUNT',
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
  const { jsonRpcProvider, network } = useConfig();
  const { addMessage } = useGlobalMessages();
  const { address } = useAccount();
  const { data: signer } = useSigner({ onError: captureException });
  const buttonText = useMemo(() => 'Mint Borrower Ticket', []);
  const [txHash, setTxHash] = useState('');
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [loanAssetOptions, setLoanAssetOptions] = useState<LoanAsset[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);

  console.log({ loanAssetOptions });

  const watchAllFields = watch();

  const wait = useCallback(async () => {
    const contract = jsonRpcLoanFacilitator(
      jsonRpcProvider,
      network as SupportedNetwork,
    );
    const filter = contract.filters.CreateLoan(null, address, null, null, null);
    contract.once(filter, (id) => {
      onApproved();
      setWaitingForTx(false);
      window.location.assign(
        `/network/${network}/loans/${id.toString()}?newLoan=true`,
      );
    });
  }, [address, jsonRpcProvider, network, onApproved]);

  const mint = useCallback(
    async ({
      loanAmount,
      interestRate,
      duration,
      denomination,
      acceptHigherLoanAmounts,
    }: CreateFormData) => {
      const parsedInterestRate = parseFloat(interestRate);
      const parsedDuration = parseFloat(duration);
      const assetContract = jsonRpcERC20Contract(
        denomination.address,
        jsonRpcProvider,
      );
      const loanAssetDecimals = await assetContract.decimals();
      const durationInSeconds = Math.ceil(parsedDuration * SECONDS_IN_A_DAY);
      const annualInterestRate = ethers.BigNumber.from(
        Math.floor(
          parsedInterestRate * 10 ** (INTEREST_RATE_PERCENT_DECIMALS - 2),
        ),
      );

      const contract = web3LoanFacilitator(
        signer!,
        network as SupportedNetwork,
      );
      onSubmit();

      wait();
      const t = await contract.createLoan(
        collateralTokenID,
        collateralAddress,
        annualInterestRate,
        acceptHigherLoanAmounts,
        ethers.utils.parseUnits(loanAmount.toString(), loanAssetDecimals),
        denomination.address,
        durationInSeconds,
        // If they've gotten this far, they must have an account.
        address!,
      );

      setTxHash(t.hash);
      setWaitingForTx(true);

      t.wait().catch((err) => {
        setWaitingForTx(false);
        onError();
        captureException(err);
        addMessage({
          kind: 'error',
          message: (
            <div>
              Failed to create loan.{' '}
              <EtherscanTransactionLink transactionHash={t.hash}>
                View transaction
              </EtherscanTransactionLink>
            </div>
          ),
        });
      });
    },
    [
      address,
      addMessage,
      collateralAddress,
      collateralTokenID,
      jsonRpcProvider,
      network,
      onError,
      onSubmit,
      signer,
      wait,
    ],
  );

  const loadAssets = useCallback(async () => {
    const response = await fetch(`/api/network/${network}/loanAssets`);
    const tokens: LoanAsset[] | null = await response.json();
    if (tokens) {
      setLoanAssetOptions(tokens.filter((t) => t.symbol !== 'MATIC'));
    }
  }, [network]);

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
              color="light"
              onBlur={() => {
                handleSelectBlur(!!watchAllFields.denomination);
                onBlur();
              }}
              isDisabled={disabled}
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
        <span>
          {watchAllFields.acceptHigherLoanAmounts
            ? 'Minimum Loan Amount'
            : 'Loan Amount'}
        </span>
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

      <label htmlFor="acceptHigherLoanAmounts">
        <span>Accept Higher Loan Amounts</span>
        <input
          id="acceptHigherLoanAmounts"
          type="checkbox"
          disabled={disabled}
          onFocus={() => onFocus('ACCEPT_HIGHER_LOAN_AMOUNT')}
          aria-invalid={!!errors.acceptHigherLoanAmounts}
          {...register('acceptHigherLoanAmounts', { onBlur: handleBlur })}
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

      <LoanTermsDisclosure
        type="CREATE"
        fields={watchAllFields}
        onClick={() => {
          onFocus('REVIEW');
          setHasReviewed(true);
        }}
      />

      <TransactionButton
        id="mintBorrowerTicket"
        text={buttonText}
        type="submit"
        txHash={txHash}
        isPending={waitingForTx}
        disabled={!hasReviewed}
      />
    </Form>
  );
}
