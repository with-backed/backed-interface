import { ethers } from 'ethers';
import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { getLiquidatedLoansForTimestamp } from 'lib/events/cron/timely';
import fetchMock from 'jest-fetch-mock';
import {
  getLastWrittenTimestamp,
  overrideLastWrittenTimestamp,
} from 'lib/notifications/repository';

let lastRun = 1645155901;
let now =
  lastRun +
  parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;
const future =
  now + parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;

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

jest.mock('lib/notifications/repository', () => ({
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
      await getLiquidatedLoansForTimestamp(now);

    expect(mockedGetExpiringLoansCall).toHaveBeenCalledTimes(2);
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(now, future);
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(lastRun, now);

    expect(liquidationOccurringLoans).toEqual([aboutToExpireLoan]);
    expect(liquidationOccurredLoans).toEqual([alreadyExpiredLoan]);
  });
});
