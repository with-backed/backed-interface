import { assign, createMachine } from 'xstate';

type Context = {
  denominationFilled: boolean;
  loanAmountFilled: boolean;
  durationFilled: boolean;
  interestRateFilled: boolean;
};

const fillDenomination = assign<Context>({
  denominationFilled: (context, event) => {
    return true;
  },
});
const clearDenomination = assign<Context>({
  denominationFilled: (context, event) => {
    return false;
  },
});

const fillLoanAmount = assign<Context>({
  loanAmountFilled: (context, event) => {
    return true;
  },
});
const clearLoanAmount = assign<Context>({
  loanAmountFilled: (context, event) => {
    return false;
  },
});

const fillDuration = assign<Context>({
  durationFilled: (context, event) => {
    return true;
  },
});
const clearDuration = assign<Context>({
  durationFilled: (context, event) => {
    return false;
  },
});

const fillInterestRate = assign<Context>({
  interestRateFilled: (context, event) => {
    return true;
  },
});
const clearInterestRate = assign<Context>({
  interestRateFilled: (context, event) => {
    return false;
  },
});

function guardIsFilled(context: Context) {
  return Object.values(context).every((v) => !!v);
}

export const createPageFormMachine = createMachine<Context>(
  {
    id: 'createPageForm',
    initial: 'noWallet',
    context: {
      denominationFilled: false,
      loanAmountFilled: false,
      durationFilled: false,
      interestRateFilled: false,
    },
    states: {
      noWallet: {
        on: {
          CONNECT: { target: 'selectNFT' },
        },
      },
      selectNFT: {
        on: {
          SELECTED: { target: 'authorizeNFT' },
        },
      },
      authorizeNFT: {
        on: {
          SUBMITTED: { target: 'pendingAuthorization' },
        },
      },
      pendingAuthorization: {
        on: {
          SUCCESS: { target: 'loanFormUnfocused' },
          FAILURE: { target: 'authorizeNFTFailure' },
        },
      },
      authorizeNFTFailure: {
        type: 'final',
      },
      loanFormUnfocused: {
        on: {
          // transient transition
          '': { target: 'mintBorrowerTicket', cond: 'guardIsFilled' },
          DENOMINATION: { target: 'denomination' },
          LOAN_AMOUNT: { target: 'loanAmount' },
          DURATION: { target: 'minimumDuration' },
          INTEREST_RATE: { target: 'maximumInterestRate' },
        },
      },
      denomination: {
        on: {
          UNFOCUS_EMPTY: {
            target: 'loanFormUnfocused',
            actions: 'clearDenomination',
          },
          UNFOCUS_FULL: {
            target: 'loanFormUnfocused',
            actions: 'fillDenomination',
          },
          LOAN_AMOUNT: { target: 'loanAmount' },
          DURATION: { target: 'minimumDuration' },
          INTEREST_RATE: { target: 'maximumInterestRate' },
        },
      },
      loanAmount: {
        on: {
          UNFOCUS_EMPTY: {
            target: 'loanFormUnfocused',
            actions: 'clearLoanAmount',
          },
          UNFOCUS_FULL: {
            target: 'loanFormUnfocused',
            actions: 'fillLoanAmount',
          },
          DENOMINATION: { target: 'denomination' },
          DURATION: { target: 'minimumDuration' },
          INTEREST_RATE: { target: 'maximumInterestRate' },
        },
      },
      minimumDuration: {
        on: {
          UNFOCUS_EMPTY: {
            target: 'loanFormUnfocused',
            actions: 'clearDuration',
          },
          UNFOCUS_FULL: {
            target: 'loanFormUnfocused',
            actions: 'fillDuration',
          },
          DENOMINATION: { target: 'denomination' },
          LOAN_AMOUNT: { target: 'loanAmount' },
          INTEREST_RATE: { target: 'maximumInterestRate' },
        },
      },
      maximumInterestRate: {
        on: {
          UNFOCUS_EMPTY: {
            target: 'loanFormUnfocused',
            actions: 'clearInterestRate',
          },
          UNFOCUS_FULL: {
            target: 'loanFormUnfocused',
            actions: 'fillInterestRate',
          },

          DENOMINATION: { target: 'denomination' },
          LOAN_AMOUNT: { target: 'loanAmount' },
          DURATION: { target: 'minimumDuration' },
        },
      },
      mintBorrowerTicket: {
        on: {
          SUBMITTED: { target: 'pendingMintBorrowerTicket' },
        },
      },
      pendingMintBorrowerTicket: {
        on: {
          SUCCESS: { target: 'mintBorrowerTicketSuccess' },
          FAILURE: { target: 'mintBorrowerTicketFailure' },
        },
      },
      mintBorrowerTicketSuccess: {
        type: 'final',
      },
      mintBorrowerTicketFailure: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      fillDenomination,
      clearDenomination,
      fillDuration,
      clearDuration,
      fillInterestRate,
      clearInterestRate,
      fillLoanAmount,
      clearLoanAmount,
    },
    guards: { guardIsFilled },
  },
);