import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { Loan } from 'types/Loan';
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from 'components/Input';
import { UseFormReturn } from 'react-hook-form';
import { Form } from 'components/Form';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { useMachine } from '@xstate/react';
import { loanFormAwaitingMachine } from './loanFormAwaitingMachine';
import { Explainer } from './Explainer';

type LoanFormAwaitingProps = {
  form: UseFormReturn<LoanFormData>;
  loan: Loan;
  needsAllowance: boolean;
  refresh: () => void;
  setNeedsAllowance: (value: boolean) => void;
};
export function LoanFormAwaiting({
  loan,
  form,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormAwaitingProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const [current, send] = useMachine(loanFormAwaitingMachine);

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
      return;
    }

    const targetTop = target!.getBoundingClientRect().top;
    const containerTop = container!.getBoundingClientRect().top;
    const result = targetTop - containerTop;
    if (result !== explainerTop) {
      setExplainerTop(result);
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

  return (
    <>
      {/* `underwrite` is any due to some automatic conversion of number values, which contradict the types */}
      <Form onSubmit={handleSubmit(underwrite as any)} autoComplete="off">
        <CompletedButton buttonText="Lend" />

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
          disabled={needsAllowance || Object.keys(errors).length > 0}
          onMouseEnter={() => send('LEND_HOVER')}
        />
      </Form>
      <Explainer
        form={form}
        state={current.toStrings()[0]}
        top={explainerTop}
      />
    </>
  );
}
