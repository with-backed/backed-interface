import { ethers } from 'ethers';
import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import fetchMock from 'jest-fetch-mock';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from 'lib/events/consumers/userNotifications/repository';
import { configs } from 'lib/config';

let lastRun = 1645155901;
let now = lastRun + 3600;

const aboutToExpireLoan = {
  ...subgraphLoan,
  borrowTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};

const alreadyExpiredLoan = {
  ...subgraphLoan,
  borrowTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
  lendTicketHolder: ethers.Wallet.createRandom().address.toLowerCase(),
};

alreadyExpiredLoan.borrowTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();
alreadyExpiredLoan.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getLoansExpiringWithin: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  overrideLastWrittenTimestamp: jest.fn(),
  getLastWrittenTimestamp: jest.fn(),
}));

const mockedGetExpiringLoansCall =
  getLoansExpiringWithin as jest.MockedFunction<typeof getLoansExpiringWithin>;

const mockedOverrideLastTimestampCall =
  overrideLastWrittenTimestamp as jest.MockedFunction<
    typeof overrideLastWrittenTimestamp
  >;
const mockedGetLastWrittenTimestampCall =
  getLastWrittenTimestamp as jest.MockedFunction<
    typeof getLastWrittenTimestamp
  >;

describe('getLiquidatedLoansForTimestamp', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetExpiringLoansCall.mockResolvedValueOnce([aboutToExpireLoan]);
    mockedGetExpiringLoansCall.mockResolvedValueOnce([alreadyExpiredLoan]);
    mockedOverrideLastTimestampCall.mockResolvedValue();
    mockedGetLastWrittenTimestampCall.mockResolvedValue(lastRun);
  });

  it('makes call to get expiring loans with correct params', async () => {
    fetchMock.mockResponse('success');

    const { liquidationOccurringLoans, liquidationOccurredLoans } =
      await getLiquidatedLoansForTimestamp(now, configs.rinkeby);

    expect(mockedGetExpiringLoansCall).toHaveBeenCalledTimes(2);
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(
      now + 24 * 3600,
      now + 25 * 3600,
      configs.rinkeby,
    );
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(
      now - 3600,
      now,
      configs.rinkeby,
    );

    expect(liquidationOccurringLoans).toEqual([aboutToExpireLoan]);
    expect(liquidationOccurredLoans).toEqual([alreadyExpiredLoan]);
  });
});
