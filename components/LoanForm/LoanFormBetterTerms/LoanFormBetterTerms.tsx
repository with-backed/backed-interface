import {
  AllowButton,
  CompletedButton,
  TransactionButton,
} from 'components/Button';
import { useLoanUnderwriter } from 'hooks/useLoanUnderwriter';
import { Loan } from 'types/Loan';
import React from 'react';
import { Input } from 'components/Input';
import { UseFormReturn } from 'react-hook-form';
import { LoanFormData } from 'components/LoanForm/LoanFormData';
import { Form } from 'components/Form';

type LoanFormBetterTermsProps = {
  form: UseFormReturn<LoanFormData>;
  loan: Loan;
  needsAllowance: boolean;
  refresh: () => void;
  setNeedsAllowance: (value: boolean) => void;
};
export function LoanFormBetterTerms({
  loan,
  form,
  needsAllowance,
  setNeedsAllowance,
  refresh,
}: LoanFormBetterTermsProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const { underwrite, transactionPending, txHash } = useLoanUnderwriter(
    loan,
    refresh,
  );

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
            {...register('loanAmount')}
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
            {...register('duration')}
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
            {...register('interestRate')}
          />
        </label>

        <AllowButton
          contractAddress={loan.loanAssetContractAddress}
          symbol={loan.loanAssetSymbol}
          callback={() => setNeedsAllowance(false)}
          done={!needsAllowance}
        />
        <TransactionButton
          text="Lend"
          type="submit"
          txHash={txHash}
          isPending={transactionPending}
          disabled={needsAllowance}
        />
      </Form>
    </>
  );
}
