import { ethers } from 'ethers';
import { getLoansExpiringWithin } from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { main } from 'lib/notifications/cron/dailyCron';
import fetchMock from 'jest-fetch-mock';

// value obtained from lib/notifications/cron/timestamps/lastWrittenTimestampTest.txt
let lastRun = 1645155901;
let now =
  1645155901 +
  parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;
const future =
  now + parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS!) * 3600;

const aboutToExpireLoan = Object.assign({}, subgraphLoan);

aboutToExpireLoan.borrowTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();
aboutToExpireLoan.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const alreadyExpiredLoan = Object.assign({}, subgraphLoan);

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
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccuring`,
      {
        body: `{\"borrowTicketHolder\":\"${aboutToExpireLoan.borrowTicketHolder}\",\"lendTicketHolder\":\"${aboutToExpireLoan.lendTicketHolder}\"}`,
        method: 'POST',
      },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env
        .NEXT_PUBLIC_PAWN_SHOP_API_URL!}/api/events/cron/LiquidationOccured`,
      {
        body: `{\"borrowTicketHolder\":\"${alreadyExpiredLoan.borrowTicketHolder}\",\"lendTicketHolder\":\"${alreadyExpiredLoan.lendTicketHolder}\"}`,
        method: 'POST',
      },
    );
  });
});
