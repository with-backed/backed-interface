import { AllowButton, TransactionButton } from 'components/Button';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { Loan } from 'types/Loan';
import React, {
  FocusEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Input } from 'components/Input';
import { useForm } from 'react-hook-form';
import { Form } from 'components/Form';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { loanPageFormSchema } from 'components/LoanForm/loanPageFormSchema';
import { useMachine } from '@xstate/react';
import { loanFormAwaitingMachine } from './loanFormAwaitingMachine';
import { Explainer } from './Explainer';
import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import { secondsBigNumToDays } from 'lib/duration';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoanTermsDisclosure } from 'components/LoanTermsDisclosure';

type LoanFormAwaitingProps = {
  balance: number;
  loan: Loan;
  needsAllowance: boolean;
  refresh: () => void;
  setNeedsAllowance: (value: boolean) => void;
};
export function LoanFormAwaiting({
  balance,
  loan,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormAwaitingProps) {
  const initialAmount = useMemo(
    () => ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals),

    [loan.loanAmount, loan.loanAssetDecimals],
  );
  const initialInterestRate = useMemo(
    () => formattedAnnualRate(loan.perAnumInterestRate),
    [loan.perAnumInterestRate],
  );
  const initialDuration = useMemo(
    () => secondsBigNumToDays(loan.durationSeconds).toString(),
    [loan.durationSeconds],
  );
  const [hasReviewed, setHasReviewed] = useState(false);

  const form = useForm<LoanFormData>({
    defaultValues: {
      duration: initialDuration,
      interestRate: initialInterestRate,
      loanAmount: initialAmount,
    },
    mode: 'all',
    resolver: yupResolver(
      loanPageFormSchema({
        duration: parseFloat(initialDuration),
        loanAmount: parseFloat(initialAmount),
        interestRate: parseFloat(initialInterestRate),
      }),
    ),
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = form;

  const watchAllFields = watch();

  const [current, send] = useMachine(loanFormAwaitingMachine);

  const [explainerTop, setExplainerTop] = useState(0);

  useEffect(() => {
    // when there's a form error, the explainer should float by the input with an error.
    const errorTarget = Object.keys(errors)[0];
    const stateTarget = current.toStrings()[0];

    const targetID =
      errorTarget ||
      (stateTarget === 'LendTermsUnfocused'
        ? 'loanFormDisclosureButton'
        : stateTarget);
    const target = document.getElementById(targetID);
    const container = document.getElementById('container');
    if (!target || !container) {
      setExplainerTop(0);
      return;
    }

    const targetTop = target!.getBoundingClientRect().top;
    const containerTop = container!.getBoundingClientRect().top;
    const result = targetTop - containerTop;
    if (result !== explainerTop) {
      setExplainerTop(result);
    }
  }, [current, errors, explainerTop]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (e.relatedTarget?.getAttribute('id') !== 'review') {
        send('BLUR');
      }
    },
    [send],
  );

  const { underwrite, transactionPending, txHash } = useLoanUnderwriter(
    loan,
    refresh,
  );

  useEffect(() => {
    if (transactionPending && txHash) {
      send('SUBMITTED');
    } else if (txHash) {
      send('SUCCESS');
    }
  }, [send, transactionPending, txHash]);

  return (
    <>
      {/* `underwrite` is any due to some automatic conversion of number values, which contradict the types */}
      <Form onSubmit={handleSubmit(underwrite as any)} autoComplete="off">
        <label htmlFor="amount">
          <span>Amount</span>
          <Input
            id="loanAmount"
            placeholder="0"
            type="text"
            color="dark"
            unit={loan.loanAssetSymbol}
            aria-invalid={!!errors.loanAmount}
            disabled={!loan.allowLoanAmountIncrease}
            onFocus={() => send('LOAN_AMOUNT')}
            {...register('loanAmount', {
              onBlur: handleBlur,
            })}
          />
        </label>

        <label htmlFor="duration">
          <span>Duration</span>
          <Input
            id="duration"
            placeholder="0"
            type="text"
            color="dark"
            unit="Days"
            aria-invalid={!!errors.duration}
            onFocus={() => send('DURATION')}
            {...register('duration', { onBlur: handleBlur })}
          />
        </label>

        <label htmlFor="interestRate">
          <span>Interest Rate</span>
          <Input
            id="interestRate"
            placeholder="0"
            type="text"
            color="dark"
            unit="%"
            aria-invalid={!!errors.interestRate}
            onFocus={() => send('INTEREST_RATE')}
            {...register('interestRate', { onBlur: handleBlur })}
          />
        </label>

        <AllowButton
          contractAddress={loan.loanAssetContractAddress}
          symbol={loan.loanAssetSymbol}
          callback={() => setNeedsAllowance(false)}
          done={!needsAllowance}
        />

        <LoanTermsDisclosure
          type="LEND"
          fields={{
            ...watchAllFields,
            denomination: {
              symbol: loan.loanAssetSymbol,
              address: loan.loanAssetContractAddress,
            },
          }}
          onClick={() => {
            setHasReviewed(true);
            send('REVIEW');
          }}
          balance={balance}
        />

        <TransactionButton
          id="Lend"
          text="Mint Lending Ticket"
          type="submit"
          txHash={txHash}
          isPending={transactionPending}
          disabled={
            needsAllowance || Object.keys(errors).length > 0 || !hasReviewed
          }
        />
      </Form>
      <Explainer
        form={form}
        state={current.toStrings()[0]}
        top={explainerTop}
        loan={loan}
      />
    </>
  );
}
