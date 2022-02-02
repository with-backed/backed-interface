import { createMachine } from 'xstate';

export const loanFormBetterTermsMachine = createMachine({
  id: 'loanFormBetterTerms',
  initial: 'LendTermsUnfocused',
  states: {
    Lend: {
      on: {
        LOAN_AMOUNT: { target: 'loanAmount' },
        DURATION: { target: 'duration' },
        INTEREST_RATE: { target: 'interestRate' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    LendPending: {
      on: {
        SUCCESS: { target: 'LendSuccess' },
      },
    },
    LendSuccess: {
      type: 'final',
    },
    LendTermsUnfocused: {
      on: {
        LOAN_AMOUNT: { target: 'loanAmount' },
        DURATION: { target: 'duration' },
        INTEREST_RATE: { target: 'interestRate' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    loanAmount: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        DURATION: { target: 'duration' },
        INTEREST_RATE: { target: 'interestRate' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    duration: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        LOAN_AMOUNT: { target: 'loanAmount' },
        INTEREST_RATE: { target: 'interestRate' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    interestRate: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        LOAN_AMOUNT: { target: 'loanAmount' },
        DURATION: { target: 'duration' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
  },
});
