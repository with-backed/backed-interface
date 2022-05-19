import {
  sendConfirmationEmail,
  sendEmailsForTriggerAndEntity,
} from 'lib/events/consumers/userNotifications/emails/emails';
import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/emails/ses';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  NotificationMethod,
  NotificationTriggerType,
} from 'lib/events/consumers/userNotifications/shared';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphCreateEvent,
  subgraphLendEvent,
  subgraphLoanForEvents,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import {
  EventsEmailComponents,
  getEmailComponentsMap,
  getEmailSubject,
} from 'lib/events/consumers/userNotifications/emails/eventsFormatter';
import {
  generateHTMLForEventsEmail,
  generateHTMLForGenericEmail,
} from 'lib/events/consumers/userNotifications/emails/mjml';

import { incrementBackedMetric } from 'lib/metrics/repository';
import { configs } from 'lib/config';

jest.mock('lib/events/consumers/userNotifications/emails/ses', () => ({
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

jest.mock(
  'lib/events/consumers/userNotifications/emails/eventsFormatter',
  () => ({
    getEmailSubject: jest.fn(),
    getEmailComponentsMap: jest.fn(),
  }),
);

const mockGetSubjectCall = getEmailSubject as jest.MockedFunction<
  typeof getEmailSubject
>;
const mockGetComponentsCall = getEmailComponentsMap as jest.MockedFunction<
  typeof getEmailComponentsMap
>;

jest.mock('lib/events/consumers/userNotifications/emails/mjml', () => ({
  generateHTMLForEventsEmail: jest.fn(),
  generateHTMLForGenericEmail: jest.fn(),
}));

const mockGetMJMLForEventsEmailCall =
  generateHTMLForEventsEmail as jest.MockedFunction<
    typeof generateHTMLForEventsEmail
  >;
const mockGetMJMLForGenericEmailCall =
  generateHTMLForGenericEmail as jest.MockedFunction<
    typeof generateHTMLForGenericEmail
  >;

jest.mock('lib/metrics/repository', () => ({
  ...jest.requireActual('lib/metrics/repository'),
  incrementBackedMetric: jest.fn(),
}));

const mockIncrementMetricCall = incrementBackedMetric as jest.MockedFunction<
  typeof incrementBackedMetric
>;

const event: NotificationTriggerType = 'All';
const notificationMethod = NotificationMethod.EMAIL;
const testRecipientOne = 'adamgobes@gmail.com';
const testRecipientTwo = 'anotherEmail@gmail.com';

const notificationReqOne: NotificationRequest = {
  id: 'uuid-1',
  ethAddress: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
  deliveryDestination: testRecipientOne,
  deliveryMethod: notificationMethod,
  event,
};

const notificationReqTwo: NotificationRequest = {
  id: 'uuid-2',
  ethAddress: '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
  deliveryDestination: testRecipientTwo,
  deliveryMethod: notificationMethod,
  event,
};

const mockEmailComponents: EventsEmailComponents = {
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
    'https://rinkeby.withbacked.xyz/loans/65',
    'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
  ],
  mainMessage: '0x10359 has been replaced as the lender on loan #65.',
  footer:
    'https://rinkeby.withbacked.xyz/profile/0x10359616ab170c1bd6c478a40c6715a49ba25efc',
};

describe('Sending emails with Amazon SES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([
      notificationReqOne,
      notificationReqTwo,
    ]); // two email addresses are subscribed to a particular eth addresses on-chain activity
    mockedSesEmailCall.mockResolvedValue(null);
    mockGetSubjectCall.mockReturnValue('');
    mockGetComponentsCall.mockResolvedValue({
      [subgraphLoanForEvents.borrowTicketHolder]: (_unsubscribeUuid: string) =>
        mockEmailComponents,
      [subgraphLoanForEvents.lendTicketHolder]: (_unsubscribeUuid: string) =>
        mockEmailComponents,
    });
    mockGetMJMLForEventsEmailCall.mockReturnValue('');
    mockGetMJMLForGenericEmailCall.mockReturnValue('');
    mockIncrementMetricCall.mockResolvedValue();
  });

  describe('Confirmation email', () => {
    beforeEach(() => {
      process.env.VERCEL_ENV = 'development';
    });
    afterEach(() => {
      process.env.VERCEL_ENV = undefined;
    });
    it('successfully calls SES send email method with correct params', async () => {
      await sendConfirmationEmail(
        notificationReqOne.deliveryDestination,
        notificationReqOne.ethAddress,
        notificationReqOne.id,
        configs.rinkeby,
      );

      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.anything(),
        'Backed: Email request received',
        testRecipientOne,
      );
    });
  });

  describe('Event trigger emails', () => {
    describe('CreateEvent', () => {
      it('successfully calls SES send email method with correct params', async () => {
        mockGetComponentsCall.mockResolvedValue({
          [subgraphCreateEvent.creator]: (_unsubscribeUuid: string) =>
            mockEmailComponents,
        });
        await sendEmailsForTriggerAndEntity(
          'CreateEvent',
          subgraphCreateEvent,
          0,
          configs.rinkeby,
        );

        expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
        expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
          subgraphLoanForEvents.borrowTicketHolder,
        );
        expect(mockedSesEmailCall).toBeCalledTimes(2);
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientOne,
        );
      });
    });
    describe('BuyoutEvent', () => {
      beforeEach(() => {
        mockGetComponentsCall.mockResolvedValue({
          [subgraphLoanForEvents.borrowTicketHolder]: (
            _unsubscribeUuid: string,
          ) => mockEmailComponents,
          [subgraphBuyoutEvent.lendTicketHolder]: (_unsubscribeUuid: string) =>
            mockEmailComponents,
          [subgraphBuyoutEvent.newLender]: (_unsubscribeUuid: string) =>
            mockEmailComponents,
        });
      });
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'BuyoutEvent',
          subgraphBuyoutEvent,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });
    });
    describe('LendEvent', () => {
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'LendEvent',
          subgraphLendEvent,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });

      it('does nothing if method is called with LendEvent and a previous terms event (indicating we have a BuyoutEvent)', async () => {
        await sendEmailsForTriggerAndEntity(
          'LendEvent',
          subgraphLendEvent,
          0,
          configs.rinkeby,
          subgraphLendEvent,
        );

        expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(0);
        expect(mockedSesEmailCall).toBeCalledTimes(0);
      });
    });
    describe('RepaymentEvent', () => {
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'RepaymentEvent',
          subgraphRepaymentEvent,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });
    });
    describe('CollateralSeizureEvent', () => {
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'CollateralSeizureEvent',
          subgraphCollateralSeizureEvent,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });
    });
    describe('LiquidationOccuring', () => {
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'LiquidationOccurring',
          subgraphLoanForEvents,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });
    });
    describe('LiquidationOccurred', () => {
      it('successfully calls SES send email method with correct params', async () => {
        await sendEmailsForTriggerAndEntity(
          'LiquidationOccurred',
          subgraphLoanForEvents,
          0,
          configs.rinkeby,
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
          '',
          expect.anything(),
          testRecipientOne,
        );
        expect(mockedSesEmailCall).toHaveBeenCalledWith(
          '',
          expect.anything(),
          testRecipientTwo,
        );
      });
    });
  });
});
