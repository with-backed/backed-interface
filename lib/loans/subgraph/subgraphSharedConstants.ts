export const ALL_LOAN_PROPERTIES = `
    id
    loanAssetContractAddress
    collateralContractAddress
    collateralTokenId
    perSecondInterestRate
    accumulatedInterest
    lastAccumulatedTimestamp
    durationSeconds
    loanAmount
    status
    closed
    loanAssetDecimal
    loanAssetSymbol
    lendTicketHolder
    borrowTicketHolder
    endDateTimestamp
    collateralTokenURI
    collateralName
`;

const CREATE_EVENT_PROPERTIES = `
    id,
    timestamp,
    blockNumber,
    creator,
    maxPerSecondInterestRate,
    minDurationSeconds,
    minLoanAmount
`;

const LEND_EVENT_PROPERTIES = `
    id, 
    lender,
    loanAmount,
    durationSeconds,
    perSecondInterestRate,
    timestamp,
    blockNumber,
    borrowTicketHolder
`;

const BUYOUT_EVENT_PROPERTIES = `
    id,
    newLender,
    lendTicketOwner,
    loanAmount,
    interestEarned,
    timestamp,
    blockNumber
`;

const REPAY_EVENT_PROPERTIES = `
    id,
    repayer,
    loanAmount,
    interestEarned,
    timestamp,
    blockNumber,
    lendTicketHolder,
    borrowTicketHolder
`;

const COLLATERAL_SEIZURE_EVENT_PROPERTIES = `
    id,
    timestamp,
    blockNumber,
    lendTicketHolder,
    borrowTicketHolder
`;

const CLOSE_EVENT_PROPERTIES = `
    id,
    timestamp,
    blockNumber,
    closer
`;

export const ALL_EVENTS = `
    createEvent{
        ${CREATE_EVENT_PROPERTIES}
    }
    lendEvents{
        ${LEND_EVENT_PROPERTIES}
    }
    buyoutEvents{
        ${BUYOUT_EVENT_PROPERTIES}
    }
    repaymentEvent{
        ${REPAY_EVENT_PROPERTIES}
    }
    collateralSeizureEvent{
        ${COLLATERAL_SEIZURE_EVENT_PROPERTIES}
    }
    closeEvent{
        ${CLOSE_EVENT_PROPERTIES}
    }
`;
