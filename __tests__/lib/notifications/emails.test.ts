import { sendEmail } from 'lib/notifications/emails';
import { executeEmailSendWithSes } from 'lib/notifications/ses';
import { NotificationEventTrigger } from 'lib/notifications/shared';

jest.mock('lib/notifications/ses', () => ({
  executeEmailSendWithSes: jest.fn(),
}));

const mockedSesEmailCall = executeEmailSendWithSes as jest.MockedFunction<
  typeof executeEmailSendWithSes
>;

const testRecipient = 'adamgobes@gmail.com';

const emailParamsMatchingObject = (text: string) => ({
  Source: process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_EMAIL!,
  Destination: {
    ToAddresses: [testRecipient],
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
    mockedSesEmailCall.mockResolvedValue();
  });
  describe('BuyoutEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmail(testRecipient, NotificationEventTrigger.BuyoutEvent);

      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was bought out'),
        ),
      );
    });
  });
  describe('LendEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmail(testRecipient, NotificationEventTrigger.LendEvent);

      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was fulfilled'),
        ),
      );
    });
  });
  describe('RepaymentEvent', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmail(testRecipient, NotificationEventTrigger.RepaymentEvent);

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
      await sendEmail(
        testRecipient,
        NotificationEventTrigger.CollateralSeizureEvent,
      );

      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your collateral was seized'),
        ),
      );
    });
  });
  describe('LiquidationOccuring', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmail(
        testRecipient,
        NotificationEventTrigger.LiquidationOccurring,
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
  describe('LiquidationOccurred', () => {
    it('successfully calls SES send email method with correct params', async () => {
      await sendEmail(
        testRecipient,
        NotificationEventTrigger.LiquidationOccurred,
      );

      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was bought out'),
        ),
      );
    });
  });
});
