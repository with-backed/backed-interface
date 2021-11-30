import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import { LoanInfo } from 'lib/LoanInfoType';

// this file is named weirdly because apparently `constants` is a reserved, deprecated module.

export const headerMessages = {
  availableForLending:
    '🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸 Available for Lending 🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸',
  test: '🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸 Get an NFT and DAI 🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸',
  create: '🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸 Create a Loan 🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸',
  ticket: ({
    loanId,
    loanAmount,
    loanAssetDecimals,
    perSecondInterestRate,
    loanAssetSymbol,
    interestOwed,
    closed,
  }: LoanInfo) => {
    if (closed) {
      return `🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸🭸 Loan #${loanId} (closed) `;
    }
    const amount = ethers.utils.formatUnits(loanAmount, loanAssetDecimals);
    const interestRate = formattedAnnualRate(perSecondInterestRate);
    const repayAmount = ethers.utils.formatUnits(
      interestOwed.add(loanAmount),
      loanAssetDecimals,
    );
    const idEntry = `Loan #${loanId}`;
    const paymentEntry = `${amount} ${loanAssetSymbol} @ ${interestRate}% = ${repayAmount} ${loanAssetSymbol} repayment`;
    return `🭸🭸 ${idEntry} 🭸🭸🭸 ${paymentEntry}  🭸🭸🭸 accruing interest 🭸`;
  },
};
