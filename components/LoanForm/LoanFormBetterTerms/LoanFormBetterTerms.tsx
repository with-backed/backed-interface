import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { Loan } from 'types/Loan';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from 'components/Input';
import { useForm } from 'react-hook-form';
import { Form } from 'components/Form';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { loanPageFormSchema } from 'components/LoanForm/loanPageFormSchema';
import { useMachine } from '@xstate/react';
import { loanFormBetterTermsMachine } from './loanFormBetterTermsMachine';
import { Explainer } from './Explainer';
import { ethers } from 'ethers';
import { annualRateToPerSecond, formattedAnnualRate } from 'lib/interest';
import { daysToSecondsBigNum, secondsBigNumToDays } from 'lib/duration';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from '../LoanForm.module.css';
import { LoanFormDisclosure } from '../LoanFormDisclosure';

type LoanFormBetterTermsProps = {
  loan: Loan;
  needsAllowance: boolean;
  refresh: () => void;
  setNeedsAllowance: (value: boolean) => void;
};
export function LoanFormBetterTerms({
  loan,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormBetterTermsProps) {
  const initialAmount = useMemo(
    () => ethers.utils.formatUnits(loan.loanAmount, loan.loanAssetDecimals),

    [loan.loanAmount, loan.loanAssetDecimals],
  );
  const initialInterestRate = useMemo(
    () => formattedAnnualRate(loan.perSecondInterestRate),
    [loan.perSecondInterestRate],
  );
  const initialDuration = useMemo(
    () => secondsBigNumToDays(loan.durationSeconds).toString(),
    [loan.durationSeconds],
  );

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

  const { duration, interestRate, loanAmount } = watch();

  const hasTenPercentImprovement = useMemo(() => {
    const durationImproved = daysToSecondsBigNum(parseFloat(duration)).gte(
      loan.durationSeconds.div(10).add(loan.durationSeconds),
    );
    const interestRateImproved = ethers.BigNumber.from(
      annualRateToPerSecond(parseFloat(interestRate)),
    ).lte(loan.perSecondInterestRate.sub(loan.perSecondInterestRate.div(10)));
    const amountImproved = ethers.utils
      .parseUnits(loanAmount, loan.loanAssetDecimals)
      .gte(loan.loanAmount.div(10).add(loan.loanAmount));

    return durationImproved || interestRateImproved || amountImproved;
  }, [duration, interestRate, loanAmount, loan]);

  const [current, send] = useMachine(loanFormBetterTermsMachine);

  const [explainerTop, setExplainerTop] = useState(0);
  useEffect(() => {
    // when there's a form error, the explainer should float by the input with an error.
    const errorTarget = Object.keys(errors)[0];
    const stateTarget = current.toStrings()[0];
    const targetID = errorTarget || stateTarget;
    const target = document.getElementById(targetID);
    const container = document.getElementById('container');
    if (!target || !container) {
      setExplainerTop(0);
    } else {
      const targetTop = target!.getBoundingClientRect().top;
      const containerTop = container!.getBoundingClientRect().top;
      const result = targetTop - containerTop;
      if (result !== explainerTop) {
        setExplainerTop(result);
      }
    }
  }, [current, errors, explainerTop]);

  const handleBlur = useCallback(() => {
    send('BLUR');
  }, [send]);

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

  const explainerState = current.toStrings()[0];
  const FormExplainer = useMemo(
    () => (
      <Explainer
        form={form}
        state={explainerState}
        top={explainerTop}
        loan={loan}
      />
    ),
    [form, explainerState, explainerTop, loan],
  );

  return (
    <div className={styles.marginTop}>
      <LoanFormDisclosure
        title={'Offer better terms'}
        rightColContent={FormExplainer}>
        {/* `underwrite` is any due to some automatic conversion of number values, which contradict the types */}
        <Form
          onSubmit={handleSubmit(underwrite as any)}
          autoComplete="off"
          // TODO: fix this style
          style={{ marginTop: 'calc(var(--gap) / 2)' }}>
          <label htmlFor="amount">
            <span>Amount</span>
            <Input
              id="loanAmount"
              placeholder="0"
              type="text"
              color="dark"
              unit={loan.loanAssetSymbol}
              aria-invalid={!!errors.loanAmount}
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
          <TransactionButton
            id="Lend"
            text="Lend"
            type="submit"
            txHash={txHash}
            isPending={transactionPending}
            disabled={
              needsAllowance ||
              Object.keys(errors).length > 0 ||
              !hasTenPercentImprovement
            }
            onMouseEnter={() => send('LEND_HOVER')}
          />
        </Form>
      </LoanFormDisclosure>
    </div>
  );
}
