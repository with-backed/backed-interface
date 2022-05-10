import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails/emails';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/processTimelyEvents';
import { configs } from 'lib/config';

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

jest.mock('lib/events/consumers/userNotifications/emails/emails', () => ({
  sendEmailsForTriggerAndEntity: jest.fn(),
}));

jest.mock('lib/events/timely/timely', () => ({
  getLiquidatedLoansForTimestamp: jest.fn(),
}));

const mockedGetLiquidatedLoansCall =
  getLiquidatedLoansForTimestamp as jest.MockedFunction<
    typeof getLiquidatedLoansForTimestamp
  >;

const mockedSendEmailCall =
  sendEmailsForTriggerAndEntity as jest.MockedFunction<
    typeof sendEmailsForTriggerAndEntity
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

    expect(mockedGetLiquidatedLoansCall).toHaveBeenCalledTimes(1);
    expect(mockedGetLiquidatedLoansCall).toHaveBeenCalledWith(
      expect.anything(),
      configs.rinkeby,
    );

    expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledTimes(2);
    expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
      'LiquidationOccurring',
      aboutToExpireLoan,
      expect.anything(),
      configs.rinkeby,
    );
    expect(sendEmailsForTriggerAndEntity).toHaveBeenCalledWith(
      'LiquidationOccurred',
      alreadyExpiredLoan,
      expect.anything(),
      configs.rinkeby,
    );

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      `notifications successfully sent`,
    );
  });
});
