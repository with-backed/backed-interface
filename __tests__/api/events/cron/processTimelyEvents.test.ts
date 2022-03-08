import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { sendEmailsForTriggerAndLoan } from 'lib/events/consumers/userNotifications/emails';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/processTimelyEvents';

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

jest.mock('lib/events/consumers/userNotifications/emails', () => ({
  sendEmailsForTriggerAndLoan: jest.fn(),
}));

jest.mock('lib/events/timely/timely', () => ({
  getLiquidatedLoansForTimestamp: jest.fn(),
}));

const mockedGetLiquidatedLoansCall =
  getLiquidatedLoansForTimestamp as jest.MockedFunction<
    typeof getLiquidatedLoansForTimestamp
  >;

const mockedSendEmailCall = sendEmailsForTriggerAndLoan as jest.MockedFunction<
  typeof sendEmailsForTriggerAndLoan
>;

describe('/api/events/cron/processTimelyEvents', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetLiquidatedLoansCall.mockResolvedValue({
      liquidationOccurringLoans: [aboutToExpireLoan],
      liquidationOccurredLoans: [alreadyExpiredLoan],
    });
    mockedSendEmailCall.mockResolvedValue();
  });

  it('makes call to get liquidated loans, gets notifications associated with addresses, and sends emails', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledTimes(4);
    expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
      'LiquidationOccurringBorrower',
      aboutToExpireLoan,
    );
    expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
      'LiquidationOccurringLender',
      aboutToExpireLoan,
    );
    expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
      'LiquidationOccurredBorrower',
      alreadyExpiredLoan,
    );
    expect(sendEmailsForTriggerAndLoan).toHaveBeenCalledWith(
      'LiquidationOccurredLender',
      alreadyExpiredLoan,
    );

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      `notifications successfully sent`,
    );
  });
});
