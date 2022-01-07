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
    creator
`;

const LEND_EVENT_PROPERTIES = `
    id, 
    timestamp,
    lender,
    loanAmount,
    perSecondInterestRate,
    durationSeconds
`;

const BUYOUT_EVENT_PROPERTIES = `
    id,
    newLender,
    previousLender,
    loanAmount,
    interestEarned,
    timestamp
`;

const REPAY_EVENT_PROPERTIES = `
    id,
    repayer,
    paidTo,
    loanAmount, 
    interestEarned,
    timestamp
`;

const COLLATERAL_SEIZURE_EVENT_PROPERTIES = `
    id,
    timestamp
`;

const CLOSE_EVENT_PROPERTIES = `
    id,
    timestamp
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
