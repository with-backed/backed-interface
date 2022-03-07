import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { subgraphLoan } from 'lib/mockData';
import { getLiquidatedLoansForTimestamp } from 'lib/events/timely/timely';
import { sendEmail } from 'lib/events/consumers/userNotifications/emails';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import {
  NotificationTriggerType,
  NotificationMethod,
} from 'lib/events/consumers/userNotifications/shared';
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

const event: NotificationTriggerType = 'All';
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

const notificationReqOccurringBorrower: NotificationRequest = {
  id: 1,
  ethAddress: aboutToExpireLoan.borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqOccurringLender: NotificationRequest = {
  id: 1,
  ethAddress: aboutToExpireLoan.borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqOccurredBorrower: NotificationRequest = {
  id: 1,
  ethAddress: alreadyExpiredLoan.borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqOccurredLender: NotificationRequest = {
  id: 1,
  ethAddress: alreadyExpiredLoan.borrowTicketHolder,
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

jest.mock('lib/events/consumers/userNotifications/emails', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

jest.mock('lib/events/timely/timely', () => ({
  getLiquidatedLoansForTimestamp: jest.fn(),
}));

const mockedGetLiquidatedLoansCall =
  getLiquidatedLoansForTimestamp as jest.MockedFunction<
    typeof getLiquidatedLoansForTimestamp
  >;

const mockedGetNotificationsCall =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const mockedSendEmailCall = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/events/cron/processTimelyEvents', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetLiquidatedLoansCall.mockResolvedValue({
      liquidationOccurringLoans: [aboutToExpireLoan],
      liquidationOccurredLoans: [alreadyExpiredLoan],
    });
    mockedGetNotificationsCall.mockResolvedValueOnce([
      notificationReqOccurringBorrower,
    ]);
    mockedGetNotificationsCall.mockResolvedValueOnce([
      notificationReqOccurringLender,
    ]);
    mockedGetNotificationsCall.mockResolvedValueOnce([
      notificationReqOccurredBorrower,
    ]);
    mockedGetNotificationsCall.mockResolvedValueOnce([
      notificationReqOccurredLender,
    ]);
    mockedSendEmailCall.mockResolvedValue();
  });

  it('makes call to get liquidated loans, gets notifications associated with addresses, and sends emails', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(4);
    expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
      aboutToExpireLoan.borrowTicketHolder,
    );
    expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
      aboutToExpireLoan.lendTicketHolder,
    );
    expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
      alreadyExpiredLoan.borrowTicketHolder,
    );
    expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
      alreadyExpiredLoan.lendTicketHolder,
    );

    expect(sendEmail).toHaveBeenCalledTimes(4);
    expect(sendEmail).toHaveBeenCalledWith(
      notificationDestination,
      'LiquidationOccurringBorrower',
      aboutToExpireLoan,
    );
    expect(sendEmail).toHaveBeenCalledWith(
      notificationDestination,
      'LiquidationOccurringLender',
      aboutToExpireLoan,
    );
    expect(sendEmail).toHaveBeenCalledWith(
      notificationDestination,
      'LiquidationOccurredBorrower',
      alreadyExpiredLoan,
    );
    expect(sendEmail).toHaveBeenCalledWith(
      notificationDestination,
      'LiquidationOccurredLender',
      alreadyExpiredLoan,
    );

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      `notifications successfully sent`,
    );
  });
});
