import { sendEmailsForTriggerAndEntity } from 'lib/events/consumers/userNotifications/emails';
import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/ses';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  NotificationMethod,
  NotificationTriggerType,
} from 'lib/events/consumers/userNotifications/shared';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphLendEvent,
  subgraphLoanForEvents,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import {
  EmailComponents,
  getEmailComponentsMap,
  getEmailSubject,
} from 'lib/events/consumers/userNotifications/formatter';

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

jest.mock('lib/events/consumers/userNotifications/formatter', () => ({
  getEmailSubject: jest.fn(),
  getEmailComponentsMap: jest.fn(),
}));

const mockGetSubjectCall = getEmailSubject as jest.MockedFunction<
  typeof getEmailSubject
>;
const mockGetComponentsCall = getEmailComponentsMap as jest.MockedFunction<
  typeof getEmailComponentsMap
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

const emailParamsMatchingObject = (toAddress: string) => ({
  Source: process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!,
  Destination: {
    ToAddresses: [toAddress],
  },
  ReplyToAddresses: [process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!],
  Message: expect.anything(),
});

const mockEmailComponents: EmailComponents = {
  header: 'Loan #65: monarchs',
  messageBeforeTerms: [
    '0x10359 held the loan for 2 days and accrued 0.00000000000001 DAI in interest over that period.',
  ],
  terms: [
    {
      prefix: '0x7e646 held the loan for 7 days, with loan terms:',
      amount: '8192.0 DAI',
      duration: '120 days',
      interest: '6.3072%',
    },
  ],
  messageAfterTerms: [
    'At this rate, repayment of 8361.869312 DAI will be due on 31/12/1969.',
  ],
  viewLinks: [
    'https://nftpawnshop.xyz/loans/65',
    'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  ],
  mainMessage: '0x10359 has been replaced as the lender on loan #65.',
  footer:
    'https://nftpawnshop.xyz/profile/0x10359616ab170c1bd6c478a40c6715a49ba25efc',
};

describe('Sending emails with Amazon SES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([
      notificationReqOne,
      notificationReqTwo,
    ]); // two email addresses are subscribed to a particular eth addresses on-chain activity
    mockedSesEmailCall.mockResolvedValue();
    mockGetSubjectCall.mockResolvedValue('');
    mockGetComponentsCall.mockResolvedValue({
      [subgraphLoanForEvents.borrowTicketHolder]: mockEmailComponents,
      [subgraphLoanForEvents.lendTicketHolder]: mockEmailComponents,
    });
  });

  describe('BuyoutEvent', () => {
    beforeEach(() => {
      mockGetComponentsCall.mockResolvedValue({
        [subgraphLoanForEvents.borrowTicketHolder]: mockEmailComponents,
        [subgraphBuyoutEvent.lendTicketHolder]: mockEmailComponents,
        [subgraphBuyoutEvent.newLender]: mockEmailComponents,
      });
    });
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity(
        'BuyoutEvent',
        subgraphBuyoutEvent,
        0,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(3);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphBuyoutEvent.lendTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphBuyoutEvent.newLender,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(6);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
  describe('LendEvent', () => {
    it.only('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity('LendEvent', subgraphLendEvent, 0);

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(4);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
  describe('RepaymentEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity(
        'RepaymentEvent',
        subgraphRepaymentEvent,
        0,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(4);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
  describe('CollateralSeizureEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
        0,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(4);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
  describe('LiquidationOccuring', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity(
        'LiquidationOccurring',
        subgraphLoanForEvents,
        0,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(4);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
  describe('LiquidationOccurred', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmailsForTriggerAndEntity(
        'LiquidationOccurred',
        subgraphLoanForEvents,
        0,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(2);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.borrowTicketHolder,
      );
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanForEvents.lendTicketHolder,
      );
      expect(mockedSesEmailCall).toBeCalledTimes(4);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientOne)),
      );
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(emailParamsMatchingObject(testRecipientTwo)),
      );
    });
  });
});
