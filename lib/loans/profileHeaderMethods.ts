import { ethers } from 'ethers';
import { getUnitPriceForCoin } from 'lib/coingecko';
import { getCurrentUnixTime } from 'lib/duration';
import { groupBy } from 'lodash';
import { Loan } from 'types/Loan';

export function getActiveLoanCount(loans: Loan[]): number {
  return loans.filter((l) => !l.closed).length;
}

export function getClosedLoanCount(loans: Loan[]): number {
  return loans.filter((l) => l.closed).length;
}

export function getNextLoanDue(loans: Loan[]): number {
  if (loans.length === 0) return 0;
  const nearestLoanDueDuration =
    loans.sort(
      (loanOne, loanTwo) => loanOne.endDateTimestamp - loanTwo.endDateTimestamp,
    )[0].endDateTimestamp - getCurrentUnixTime().toNumber();
  return nearestLoanDueDuration > 0 ? nearestLoanDueDuration : 0;
}

export type ERC20Amount = {
  nominal: string;
  symbol: string;
  address: string;
};

function getSummedFieldByERC20(
  loans: Loan[],
  selector: (loan: Loan) => ethers.BigNumber,
): ERC20Amount[] {
  const loansByERC20 = groupBy(loans, (l) => l.loanAssetContractAddress);
  return Object.keys(loansByERC20).map((erc) => {
    const symbol = loansByERC20[erc][0].loanAssetSymbol;
    const decimals = loansByERC20[erc][0].loanAssetDecimals;
    const address = loansByERC20[erc][0].loanAssetContractAddress;

    return {
      symbol,
      nominal: ethers.utils.formatUnits(
        loansByERC20[erc].reduce(
          (prev, current) => prev.add(selector(current)),
          ethers.BigNumber.from(0),
        ),
        decimals,
      ),
      address,
    };
  });
}

export function getAllPrincipalAmounts(loans: Loan[]): ERC20Amount[] {
  return getSummedFieldByERC20(loans, (loan) => loan.loanAmount);
}

export function getAllInterestAmounts(loans: Loan[]): ERC20Amount[] {
  return getSummedFieldByERC20(loans, (loan) => loan.interestOwed);
}

export async function getTotalInUSD(erc20s: ERC20Amount[]): Promise<number> {
  let total = 0;
  for (let i = 0; i < erc20s.length; i++) {
    total +=
      parseFloat(erc20s[i].nominal) *
      (await getUnitPriceForCoin(erc20s[i].address));
  }
  return total;
}
