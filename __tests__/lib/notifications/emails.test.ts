import { subgraphLoan } from 'lib/mockData';
import { sendEmail } from 'lib/notifications/emails';
import { executeEmailSendWithSes } from 'lib/notifications/ses';
import { EmailTriggerType } from 'lib/notifications/shared';
import { nftBackedLoansClient } from 'lib/urql';

jest.mock('lib/urql', () => ({
  ...jest.requireActual('lib/urql'),
  nftBackedLoansClient: {
    query: jest.fn(),
  },
}));

const mockedNftBackedLoansClientQuery =
  nftBackedLoansClient.query as jest.MockedFunction<
    typeof nftBackedLoansClient.query
  >;

jest.mock('lib/notifications/ses', () => ({
  executeEmailSendWithSes: jest.fn(),
}));

const mockedSesEmailCall = executeEmailSendWithSes as jest.MockedFunction<
  typeof executeEmailSendWithSes
>;

const testRecipient = 'adamgobes@gmail.com';

let loan = subgraphLoan;

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
      await sendEmail(testRecipient, 'BuyoutEvent', loan);

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
      await sendEmail(testRecipient, 'LendEvent', loan, false);

      expect(mockedSesEmailCall).toBeCalledTimes(1);
      expect(mockedSesEmailCall).toHaveBeenCalledWith(
        expect.objectContaining(
          emailParamsMatchingObject('Your loan was fulfilled'),
        ),
      );
    });

    it('successfully calls SES send email method with correct params when there was a previous lender', async () => {
      await sendEmail(testRecipient, 'LendEvent', loan, true);

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
      await sendEmail(testRecipient, 'RepaymentEvent', loan);

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
      await sendEmail(testRecipient, 'CollateralSeizureEvent', loan);

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
      await sendEmail(testRecipient, 'LiquidationOccurringBorrower', loan);

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
      await sendEmail(testRecipient, 'LiquidationOccurringLender', loan);

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
      await sendEmail(testRecipient, 'LiquidationOccurredBorrower', loan);

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
      await sendEmail(testRecipient, 'LiquidationOccurredLender', loan);

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
