import { ethers } from 'ethers';
import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { main } from 'lib/notifications/dailyCron';
import fetchMock from 'jest-fetch-mock';

// value obtained from lib/notifications/cron/lastWrittenTimestampTest.txt
let lastRun = 1645155901;
let now = 1645155901 + parseInt(process.env.FREQUENCY!) * 3600;
const future = now + parseInt(process.env.FREQUENCY!) * 3600;

const aboutToExpireLoan = subgraphLoan;

aboutToExpireLoan.borrowTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();
aboutToExpireLoan.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const alreadyExpiredLoan = subgraphLoan;

alreadyExpiredLoan.borrowTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();
alreadyExpiredLoan.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getLoansExpiringWithin: jest.fn(),
}));

const mockedGetExpiringLoansCall =
  getLoansExpiringWithin as jest.MockedFunction<typeof getLoansExpiringWithin>;

describe('daily cron job', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetExpiringLoansCall.mockResolvedValueOnce([aboutToExpireLoan]);
    mockedGetExpiringLoansCall.mockResolvedValueOnce([alreadyExpiredLoan]);
  });

  it('makes call to get expiring loans with correct params', async () => {
    fetchMock.mockResponse('success');
    await main(now);

    expect(mockedGetExpiringLoansCall).toHaveBeenCalledTimes(2);
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(now, future);
    expect(mockedGetExpiringLoansCall).toHaveBeenCalledWith(lastRun, now);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PAWN_SHOP_URL!}/api/events/cron/LiquidationOccuring`,
      expect.objectContaining({
        body: {
          borrowTicketHolder: aboutToExpireLoan.borrowTicketHolder,
          lendTicketHolder: aboutToExpireLoan.lendTicketHolder,
        },
        method: 'POST',
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.PAWN_SHOP_URL!}/api/events/cron/LiquidationOccured`,
      expect.objectContaining({
        body: {
          borrowTicketHolder: aboutToExpireLoan.borrowTicketHolder,
          lendTicketHolder: aboutToExpireLoan.lendTicketHolder,
        },
        method: 'POST',
      }),
    );
    // expect(fetchMock).toHaveBeenCalledWith(`${process.env.PAWN_SHOP_URL!}/api/events/cron/LiquidationOccured`)
  });
});
