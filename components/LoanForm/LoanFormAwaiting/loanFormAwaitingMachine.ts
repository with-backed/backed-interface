import { createMachine } from 'xstate';

export const loanFormAwaitingMachine = createMachine({
  id: 'loanFormAwaiting',
  initial: 'LendTermsUnfocused',
  states: {
    Lend: {
      on: {
        LOAN_AMOUNT: { target: 'loanAmount' },
        DURATION: { target: 'duration' },
        INTEREST_RATE: { target: 'interestRate' },
        REVIEW: { target: 'review' },
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
        REVIEW: { target: 'review' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    loanAmount: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        DURATION: { target: 'duration' },
        INTEREST_RATE: { target: 'interestRate' },
        REVIEW: { target: 'review' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    duration: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        LOAN_AMOUNT: { target: 'loanAmount' },
        INTEREST_RATE: { target: 'interestRate' },
        REVIEW: { target: 'review' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    interestRate: {
      on: {
        BLUR: { target: 'LendTermsUnfocused' },
        LOAN_AMOUNT: { target: 'loanAmount' },
        DURATION: { target: 'duration' },
        REVIEW: { target: 'review' },
        LEND_HOVER: { target: 'Lend' },
        SUBMITTED: { target: 'LendPending' },
      },
    },
    review: {
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
