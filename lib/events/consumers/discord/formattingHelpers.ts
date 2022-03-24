import { ethers } from 'ethers';
import { formattedAnnualRate } from 'lib/interest';
import { formattedDuration } from '../userNotifications/helpers';

export function discordLoanHyperlink(loanId: string, collateralName: string) {
  return `[https://rinkeby.withbacked.xyz/loans/${loanId}](Loan #${loanId}: ${collateralName})`;
}

export function formatTermsForBot(
  loanAmount: number,
  loanAssetDecimal: number,
  perSecondInterestRate: number,
  durationSeconds: number,
  loanAssetSymbol: string,
): string {
  const parsedLoanAmount = ethers.utils.formatUnits(
    loanAmount.toString(),
    loanAssetDecimal,
  );
  const amount = `${parsedLoanAmount} ${loanAssetSymbol}`;

  const interest = formattedAnnualRate(
    ethers.BigNumber.from(perSecondInterestRate),
  );

  return `Loan amount: ${amount}\nDuration: ${formattedDuration(
    durationSeconds,
  )}\nInterest: ${interest}%`;
}
