import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphCreateEvent,
  subgraphLendEvent,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import { tweet } from 'lib/events/consumers/twitter/api';
import { sendTweetForTriggerAndEntity } from 'lib/events/consumers/twitter/formatter';

jest.mock('lib/events/consumers/twitter/api', () => ({
  tweet: jest.fn(),
}));

const mockTweetCall = tweet as jest.MockedFunction<typeof tweet>;

describe('Formatting events for tweet updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTweetCall.mockResolvedValue();
  });

  describe('CreateEvent', () => {
    it('Correctly formats event for tweet', async () => {
      await sendTweetForTriggerAndEntity('CreateEvent', subgraphCreateEvent);

      expect(mockTweetCall).toHaveBeenCalledTimes(1);
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x0dd7d has created a loan with collateral: monarchs #147',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: https://rinkeby.withbacked.xyz/loans/65',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
        ),
        undefined,
      );
    });
  });

  describe('LendEvent', () => {
    it('Correctly formats event for tweet', async () => {
      await sendTweetForTriggerAndEntity('LendEvent', subgraphLendEvent);

      expect(mockTweetCall).toHaveBeenCalledTimes(1);
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been lent to by 0x7e646',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: https://rinkeby.withbacked.xyz/loans/65',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
        ),
        undefined,
      );
    });
  });

  describe('BuyoutEvent', () => {
    it('Correctly formats event for tweet', async () => {
      await sendTweetForTriggerAndEntity('BuyoutEvent', subgraphBuyoutEvent, {
        ...subgraphLendEvent,
        loanAmount: '8000000000000000000000',
        timestamp: subgraphLendEvent.timestamp - 86400 * 2,
      });

      expect(mockTweetCall).toHaveBeenCalledTimes(1);
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been bought out by 0x7e646',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x10359 held the loan for 2 days and earned 0.00000000000001 DAI over that time',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('8000.0 DAI'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('8193.0 DAI'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: https://rinkeby.withbacked.xyz/loans/65',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
        ),
        undefined,
      );
    });
  });

  describe('RepaymentEvent', () => {
    it('Correctly formats event for tweet', async () => {
      await sendTweetForTriggerAndEntity(
        'RepaymentEvent',
        subgraphRepaymentEvent,
      );

      expect(mockTweetCall).toHaveBeenCalledTimes(1);
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been repaid by 0x0dd7d',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: https://rinkeby.withbacked.xyz/loans/65',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
        ),
        undefined,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    it('Correctly formats event for tweet', async () => {
      await sendTweetForTriggerAndEntity(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
      );

      expect(mockTweetCall).toHaveBeenCalledTimes(1);
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has had its collateral seized',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          "0x7e646 held the loan for 53 minutes. The loan became due on 01/01/1970 with a repayment cost of 8361.869312 DAI. 0x0dd7d did not repay, so 0x7e646 was able to seize the loan's collateral",
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: https://rinkeby.withbacked.xyz/loans/65',
        ),
        undefined,
      );
      expect(mockTweetCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
        ),
        undefined,
      );
    });
  });
});
