import {
  getEmailComponentsMap,
  getEmailSubject,
} from 'lib/events/consumers/userNotifications/emails/eventsFormatter';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphCreateEvent,
  subgraphLendEvent,
  subgraphLoanForEvents,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';

const now = 1647357808;

describe('Transforming on-chain events to email components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('CreateEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject('CreateEvent', subgraphCreateEvent);
      const emailComponentsMap = await getEmailComponentsMap(
        'CreateEvent',
        subgraphCreateEvent,
        now,
      );

      expect(subject).toEqual('Loan #65 has been created');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphLendEvent.borrowTicketHolder](
          'borrower-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');

      expect(borrowerComponents.mainMessage).toEqual(
        '0x0dd7d has created a loan with collateral: monarchs #147.',
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: 'Their desired loan terms are:',
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);

      expect(borrowerComponents.messageAfterTerms).toEqual([]);

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
    });
  });
  describe('BuyoutEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject('BuyoutEvent', subgraphBuyoutEvent);
      const emailComponentsMap = await getEmailComponentsMap(
        'BuyoutEvent',
        subgraphBuyoutEvent,
        now,
        {
          ...subgraphLendEvent,
          loanAmount: '8000000000000000000000',
          timestamp: subgraphLendEvent.timestamp - 86400 * 2,
        },
      );

      expect(subject).toEqual('Loan #65 has a new lender');

      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x10359616ab170c1bd6c478a40c6715a49ba25efc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphBuyoutEvent.loan.borrowTicketHolder](
          'borrower-uuid',
        );
      const newLenderComponents =
        emailComponentsMap![subgraphBuyoutEvent.newLender]('lender-uuid');
      const oldLenderComponents =
        emailComponentsMap![subgraphBuyoutEvent.lendTicketHolder](
          'old-lender-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect([borrowerComponents.header, borrowerComponents.header]).toEqual([
        newLenderComponents.header,
        oldLenderComponents.header,
      ]);

      expect(borrowerComponents.messageBeforeTerms).toEqual([
        '0x10359 held the loan for 2 days and accrued 0.00000000000001 DAI in interest over that period.',
      ]);
      expect([
        borrowerComponents.messageBeforeTerms,
        borrowerComponents.messageBeforeTerms,
      ]).toEqual([
        newLenderComponents.messageBeforeTerms,
        oldLenderComponents.messageBeforeTerms,
      ]);

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: 'Their loan terms were:',
          amount: '8000.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
        {
          prefix: 'The new terms set by 0x7e646 are:',
          amount: '8193.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect([borrowerComponents.terms, borrowerComponents.terms]).toEqual([
        newLenderComponents.terms,
        oldLenderComponents.terms,
      ]);

      expect(borrowerComponents.messageAfterTerms).toEqual([
        'At this rate, repayment of 8246.74608 DAI will be due on 01/01/1970.',
      ]);
      expect([
        borrowerComponents.messageAfterTerms,
        borrowerComponents.messageAfterTerms,
      ]).toEqual([
        newLenderComponents.messageAfterTerms,
        oldLenderComponents.messageAfterTerms,
      ]);

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect([
        borrowerComponents.viewLinks,
        borrowerComponents.viewLinks,
      ]).toEqual([
        newLenderComponents.viewLinks,
        oldLenderComponents.viewLinks,
      ]);

      expect(borrowerComponents.mainMessage).toEqual(
        'The loan created by 0x0dd7d has been bought out with new terms.',
      );
      expect(oldLenderComponents.mainMessage).toEqual(
        '0x10359 has been replaced as the lender on loan #65.',
      );
      expect(newLenderComponents.mainMessage).toEqual(
        '0x7e646 replaced 0x10359 as lender.',
      );

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(oldLenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x10359616ab170c1bd6c478a40c6715a49ba25efc?unsubscribe=true&uuid=old-lender-uuid',
      );
      expect(newLenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
  describe('LendEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject('LendEvent', subgraphLendEvent);
      const emailComponentsMap = await getEmailComponentsMap(
        'LendEvent',
        subgraphLendEvent,
        now,
      );

      expect(subject).toEqual('Loan #65 has been fulfilled');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphLendEvent.borrowTicketHolder](
          'borrower-uuid',
        );
      const lenderComponents =
        emailComponentsMap![subgraphLendEvent.lender]('lender-uuid');

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect(borrowerComponents.header).toEqual(lenderComponents.header);

      expect(borrowerComponents.mainMessage).toEqual(
        'The loan created by 0x0dd7d has been lent to by 0x7e646',
      );
      expect(borrowerComponents.mainMessage).toEqual(
        lenderComponents.mainMessage,
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);
      expect(borrowerComponents.messageBeforeTerms).toEqual(
        lenderComponents.messageBeforeTerms,
      );

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: '0x7e646 lent at terms:',
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect(borrowerComponents.terms).toEqual(lenderComponents.terms);

      expect(borrowerComponents.messageAfterTerms).toEqual([
        'At this rate, repayment of 8245.73952 DAI will be due on 01/01/1970',
      ]);
      expect(borrowerComponents.messageAfterTerms).toEqual(
        lenderComponents.messageAfterTerms,
      );

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(borrowerComponents.viewLinks).toEqual(lenderComponents.viewLinks);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(lenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
  describe('RepaymentEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject('RepaymentEvent', subgraphRepaymentEvent);
      const emailComponentsMap = await getEmailComponentsMap(
        'RepaymentEvent',
        subgraphRepaymentEvent,
        now,
      );

      expect(subject).toEqual('Loan #65 has been repaid');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphRepaymentEvent.repayer]('borrower-uuid');
      const lenderComponents =
        emailComponentsMap![subgraphRepaymentEvent.lendTicketHolder](
          'lender-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect(borrowerComponents.header).toEqual(lenderComponents.header);
      expect(borrowerComponents.mainMessage).toEqual('0x0dd7d repaid the loan');
      expect(borrowerComponents.mainMessage).toEqual(
        lenderComponents.mainMessage,
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);
      expect(borrowerComponents.messageBeforeTerms).toEqual(
        lenderComponents.messageBeforeTerms,
      );

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: `0x7e646 held the loan for 2 hours, with loan terms:`,
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect(borrowerComponents.terms).toEqual(lenderComponents.terms);

      expect(borrowerComponents.messageAfterTerms).toEqual([
        'They accrued 0.1 DAI over that period.',
        'The total cost to repay was 8192.1 DAI.',
      ]);
      expect(borrowerComponents.messageAfterTerms).toEqual(
        lenderComponents.messageAfterTerms,
      );

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(borrowerComponents.viewLinks).toEqual(lenderComponents.viewLinks);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(lenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
  describe('CollateralSeizureEvent', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
      );
      const emailComponentsMap = await getEmailComponentsMap(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
        now,
      );

      expect(subject).toEqual('Loan #65 collateral has been seized');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphLoanForEvents.borrowTicketHolder](
          'borrower-uuid',
        );
      const lenderComponents =
        emailComponentsMap![subgraphLoanForEvents.lendTicketHolder](
          'lender-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect(borrowerComponents.header).toEqual(lenderComponents.header);
      expect(borrowerComponents.mainMessage).toEqual(
        'Lender 0x7e646 has seized the collateral NFT on Loan #65',
      );
      expect(borrowerComponents.mainMessage).toEqual(
        lenderComponents.mainMessage,
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);
      expect(borrowerComponents.messageBeforeTerms).toEqual(
        lenderComponents.messageBeforeTerms,
      );

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: '0x7e646 held the loan for 53 minutes at terms:',
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect(borrowerComponents.messageAfterTerms).toEqual([
        'The loan became due on 01/01/1970 with a repayment cost of 8245.73952 DAI.',
        'Borrower 0x0dd7d did not repay, so 0x7e646 was able to seize the collateral NFT on 02/17/2022.',
      ]);

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        'https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
      ]);
      expect(borrowerComponents.viewLinks).toEqual(lenderComponents.viewLinks);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(lenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
  describe('LiquidationOccuring', () => {
    it('returns correct email components and subject for email', async () => {
      const subject = getEmailSubject(
        'LiquidationOccurring',
        subgraphLoanForEvents,
      );
      const emailComponentsMap = await getEmailComponentsMap(
        'LiquidationOccurring',
        subgraphLoanForEvents,
        now,
      );

      expect(subject).toEqual('Loan #65 is approaching due');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphLoanForEvents.borrowTicketHolder](
          'borrower-uuid',
        );
      const lenderComponents =
        emailComponentsMap![subgraphLoanForEvents.lendTicketHolder](
          'lender-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect(borrowerComponents.header).toEqual(lenderComponents.header);
      expect(borrowerComponents.mainMessage).toEqual(
        'This loan will be due in 24 hours',
      );
      expect(borrowerComponents.mainMessage).toEqual(
        lenderComponents.mainMessage,
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);
      expect(borrowerComponents.messageBeforeTerms).toEqual(
        lenderComponents.messageBeforeTerms,
      );

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: '0x7e646 held the loan for 25 days, with loan terms:',
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect(borrowerComponents.terms).toEqual(lenderComponents.terms);

      expect(borrowerComponents.messageAfterTerms).toEqual([
        'They accrued 8203.14112 DAI over that period.',
        'At this rate, repayment of 8245.73952 DAI will be due on 01/01/1970',
      ]);
      expect(borrowerComponents.messageAfterTerms).toEqual(
        lenderComponents.messageAfterTerms,
      );

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        '',
      ]);
      expect(borrowerComponents.viewLinks).toEqual(lenderComponents.viewLinks);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(lenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
  describe('LiquidationOccurred', () => {
    it('returns correct email components and subject for email', async () => {
      const expiredLoan = {
        ...subgraphLoanForEvents,
        endDateTimestamp:
          subgraphLoanForEvents.lastAccumulatedTimestamp + 7 * 86400,
      };
      const subject = getEmailSubject('LiquidationOccurred', expiredLoan);
      const emailComponentsMap = await getEmailComponentsMap(
        'LiquidationOccurred',
        expiredLoan,
        now,
      );

      expect(subject).toEqual('Loan #65 is past due');
      expect(Object.keys(emailComponentsMap!).sort()).toEqual([
        '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
        '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
      ]);

      const borrowerComponents =
        emailComponentsMap![subgraphCollateralSeizureEvent.borrowTicketHolder](
          'borrower-uuid',
        );
      const lenderComponents =
        emailComponentsMap![subgraphCollateralSeizureEvent.lendTicketHolder](
          'lender-uuid',
        );

      expect(borrowerComponents.header).toEqual('Loan #65: monarchs');
      expect(borrowerComponents.header).toEqual(lenderComponents.header);
      expect(borrowerComponents.mainMessage).toEqual(
        'The loan is past due, and its NFT collateral may be seized.',
      );
      expect(borrowerComponents.mainMessage).toEqual(
        lenderComponents.mainMessage,
      );

      expect(borrowerComponents.messageBeforeTerms).toEqual([]);
      expect(borrowerComponents.messageBeforeTerms).toEqual(
        lenderComponents.messageBeforeTerms,
      );

      expect(borrowerComponents.terms).toEqual([
        {
          prefix: '0x7e646 held the loan for 7 days, with loan terms:',
          amount: '8192.0 DAI',
          duration: '120 days',
          interest: '2.0%',
        },
      ]);
      expect(borrowerComponents.terms).toEqual(lenderComponents.terms);

      expect(borrowerComponents.messageAfterTerms).toEqual([
        'They accrued 53.73952 DAI.',
        'The loan became due on 02/24/2022 with a repayment cost of 8245.73952 DAI',
        'Unless borrower 0x0dd7d repays, 0x7e646 may seize the collateral NFT.',
      ]);
      expect(borrowerComponents.messageAfterTerms).toEqual(
        lenderComponents.messageAfterTerms,
      );

      expect(borrowerComponents.viewLinks).toEqual([
        'https://rinkeby.withbacked.xyz/loans/65',
        '',
      ]);
      expect(borrowerComponents.viewLinks).toEqual(lenderComponents.viewLinks);

      expect(borrowerComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x0dd7d78ed27632839cd2a929ee570ead346c19fc?unsubscribe=true&uuid=borrower-uuid',
      );
      expect(lenderComponents.footer).toEqual(
        'https://rinkeby.withbacked.xyz/profile/0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866?unsubscribe=true&uuid=lender-uuid',
      );
    });
  });
});
