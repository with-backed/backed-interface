import {
  getEmailComponents,
  getEmailSubject,
} from 'lib/events/consumers/userNotifications/formatter';
import { getMostRecentTermsForLoan } from 'lib/loans/subgraph/subgraphLoans';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphLendEvent,
  subgraphLoanForEvents,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getMostRecentTermsForLoan: jest.fn(),
}));

const mockedRecentTermsEvent = getMostRecentTermsForLoan as jest.MockedFunction<
  typeof getMostRecentTermsForLoan
>;

const now = 1647357808;

describe('Sending emails with Amazon SES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BuyoutEvent', () => {
    beforeEach(() => {
      mockedRecentTermsEvent.mockResolvedValue({
        ...subgraphLendEvent,
        loanAmount: '8000000000000000000000',
        timestamp: subgraphLendEvent.timestamp - 86400 * 2,
      });
    });

    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject('BuyoutEvent', subgraphBuyoutEvent);
      const emailComponents = await getEmailComponents(
        'BuyoutEvent',
        subgraphBuyoutEvent,
        now,
      );

      expect(subject).toEqual('Loan # has a new lender');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual(
        '0x7e646 replaced 0x10359 as lender',
      );
      expect(emailComponents!.loanDetails).toEqual([
        '0x10359 held the loan for 2 days and accrued 0.00000000000001 DAI in interest over that period.',
        'Their loan terms were [8000.0 DAI, 120 days, 6.3072%].',
        'The new terms set by 0x7e646 are [8192.0 DAI, 120 days, 6.3072%]',
        'At this rate, repayment of 8361.869312 DAI will be due on 31/12/1969',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(emailComponents!.footer).toEqual(
        'https://nftpawnshop.xyz/profile/0x10359616ab170c1bd6c478a40c6715a49ba25efc',
      );
    });
  });
  describe('LendEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject('LendEvent', subgraphLendEvent);
      const emailComponents = await getEmailComponents(
        'LendEvent',
        subgraphLendEvent,
        now,
      );

      expect(subject).toEqual('Loan # has been fulfilled');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual(
        'The loan created by 0x0dd7d has been lent to by 0x7e646',
      );
      expect(emailComponents!.loanDetails).toEqual([
        '0x7e646 lent at terms [8192.0 DAI, 120 days, 6.3072%].',
        'At this rate, repayment of 8361.869312 DAI will be due on 31/12/1969',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(emailComponents!.footer).toEqual(
        'https://nftpawnshop.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
      );
    });
  });
  describe('RepaymentEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject(
        'RepaymentEvent',
        subgraphRepaymentEvent,
      );
      const emailComponents = await getEmailComponents(
        'RepaymentEvent',
        subgraphRepaymentEvent,
        now,
      );

      expect(subject).toEqual('Loan # has been repaid');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual('0x0dd7d repaid the loan');
      expect(emailComponents!.loanDetails).toEqual([
        '0x7e646 held the loan for 2 hours, with loan terms of [8192.0 DAI, 120 days, 6.3072%], and accrued 0.1 DAI over that period.',
        'The total cost to repay was 8192.1 DAI.',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(emailComponents!.footer).toEqual(
        'https://nftpawnshop.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      );
    });
  });
  describe('CollateralSeizureEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
      );
      const emailComponents = await getEmailComponents(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
        now,
      );

      expect(subject).toEqual('Loan # collateral has been seized');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual(
        'Lender 0x7e646 has seized the collateral NFT on Loan #65',
      );
      expect(emailComponents!.loanDetails).toEqual([
        '0x7e646 held the loan for 53 minutes at terms [8192.0 DAI, 120 days, 6.3072%].',
        'The loan became due on 31/12/1969 with a repayment cost of 8361.869312 DAI.',
        'Borrower 0x0dd7d did not repay, so 0x7e646 was able to seize the collateral NFT on 17/02/2022.',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(emailComponents!.footer).toEqual(
        'https://nftpawnshop.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
      );
    });
  });
  describe('LiquidationOccuring', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject(
        'LiquidationOccurring',
        subgraphLoanForEvents,
      );
      const emailComponents = await getEmailComponents(
        'LiquidationOccurring',
        subgraphLoanForEvents,
        now,
      );

      expect(subject).toEqual('Loan # is approaching due');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual(
        'This loan will be due in 24 hours',
      );
      expect(emailComponents!.loanDetails).toEqual([
        '0x7e646 held the loan for 25 days, with loan terms [8192.0 DAI, 120 days, 6.3072%], and accrued 8228.778934272 DAI over that period.',
        'At this rate, repayment of 8361.869312 DAI will be due on 31/12/1969',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        '',
      ]);
      expect(emailComponents!.footer).toEqual('https://nftpawnshop.xyz');
    });
  });
  describe('LiquidationOccurred', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = await getEmailSubject(
        'LiquidationOccurred',
        subgraphBuyoutEvent,
      );
      const emailComponents = await getEmailComponents(
        'LiquidationOccurred',
        {
          ...subgraphLoanForEvents,
          endDateTimestamp:
            subgraphLoanForEvents.lastAccumulatedTimestamp + 7 * 86400,
        },
        now,
      );

      expect(subject).toEqual('Loan # is past due');

      expect(emailComponents!.header).toEqual('Loan #65: monarchs');
      expect(emailComponents!.mainMessage).toEqual(
        'The loan is past due, and its NFT collateral may be seized',
      );
      expect(emailComponents!.loanDetails).toEqual([
        '0x7e646 held the loan for 7 days, with loan terms [8192.0 DAI, 120 days, 6.3072%], and accrued 169.869312 DAI',
        'The loan became due on 24/02/2022 with a repayment cost of 8361.869312 DAI',
        'Unless borrower 0x0dd7d repays, 0x7e646 may seize the collateral NFT.',
      ]);
      expect(emailComponents!.viewLinks).toEqual([
        'https://nftpawnshop.xyz/loans/65',
        '',
      ]);
      expect(emailComponents!.footer).toEqual('https://nftpawnshop.xyz');
    });
  });
});
