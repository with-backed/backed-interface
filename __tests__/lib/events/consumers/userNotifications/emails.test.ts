import { subgraphLoan } from 'lib/mockData';
import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/ses';
import { nftBackedLoansClient } from 'lib/urql';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  NotificationMethod,
  NotificationTriggerType,
} from 'lib/events/consumers/userNotifications/shared';

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClient: {
    query: jest.fn(),
  },
}));

jest.mock('lib/events/consumers/userNotifications/ses', () => ({
  executeEmailSendWithSes: jest.fn(),
}));

const mockedSesEmailCall = executeEmailSendWithSes as jest.MockedFunction<
  typeof executeEmailSendWithSes
>;

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

const mockedGetNotificationsCall =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const event: NotificationTriggerType = 'All';
const notificationMethod = NotificationMethod.EMAIL;
const testRecipientOne = 'adamgobes@gmail.com';
const testRecipientTwo = 'anotherEmail@gmail.com';

const notificationReqOne: NotificationRequest = {
  id: 1,
  ethAddress: '', // we don't care what this is for these tests
  deliveryDestination: testRecipientOne,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqTwo: NotificationRequest = {
  id: 1,
  ethAddress: '', // we don't care what this is for these tests
  deliveryDestination: testRecipientTwo,
  deliveryMethod: notificationMethod,
  event,
};

let loan = subgraphLoan;

const emailParamsMatchingObject = (text: string) => ({
  Source: process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!,
  Destination: {
    ToAddresses: [testRecipientOne, testRecipientTwo],
  },
  ReplyToAddresses: [process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!],
  Message: expect.objectContaining({
    Body: expect.objectContaining({
      Html: expect.objectContaining({
        Data: expect.stringContaining(text),
      }),
    }),
  }),
});

describe('Sending emails with Amazon SES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([
      notificationReqOne,
      notificationReqTwo,
    ]); // two email addresses are subscribed to a particular eth addresses on-chain activity
    mockedSesEmailCall.mockResolvedValue();
  });

  describe('BuyoutEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('BuyoutEvent', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was bought out'),
        ),
      );
    });
  });
  describe('LendEvent', () => {
    it('successfully calls SES send email method with correct params when there was no previous lender', async () => {
      await sendEmailsForTriggerAndEntity('LendEvent', loan, false);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.borrowTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was fulfilled'),
        ),
      );
    });

    it('successfully calls SES send email method with correct params when there was a previous lender', async () => {
      await sendEmailsForTriggerAndEntity('LendEvent', loan, true);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.borrowTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject(
            'The terms for one of your loans has been improved',
          ),
        ),
      );
    });
  });
  describe('RepaymentEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('RepaymentEvent', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was repaid'),
        ),
      );
    });
  });
  describe('CollateralSeizureEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('CollateralSeizureEvent', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.borrowTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your collateral was seized'),
        ),
      );
    });
  });
  describe('LiquidationOccuringBorrower', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('LiquidationOccurringBorrower', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.borrowTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject(
            'Your NFT collateral is approaching liquidation',
          ),
        ),
      );
    });
  });
  describe('LiquidationOccuringLender', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('LiquidationOccurringLender', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject(
            'An NFT you have lent against can be seized soon',
          ),
        ),
      );
    });
  });
  describe('LiquidationOccurredBorrower', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('LiquidationOccurredBorrower', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.borrowTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your NFT collateral can be liquidated'),
        ),
      );
    });
  });
  describe('LiquidationOccurredLender', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('LiquidationOccurredLender', loan);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        loan.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject(
            'An NFT you have lent against can be seized',
          ),
        ),
      );
    });
  });
});
