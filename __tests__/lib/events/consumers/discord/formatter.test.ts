import { sendBotUpdateForTriggerAndEntity } from 'lib/events/consumers/discord/formatter';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphCreateEvent,
  subgraphLendEvent,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import { collateralToDiscordMessageEmbed } from 'lib/events/consumers/discord/attachments';
import { getNFTInfoForAttachment } from 'lib/events/consumers/getNftInfoForAttachment';
import { configs } from 'lib/config';

jest.mock('lib/events/consumers/discord/bot', () => ({
  sendBotMessage: jest.fn(),
}));

jest.mock('lib/events/consumers/discord/attachments', () => ({
  collateralToDiscordMessageEmbed: jest.fn(),
}));

jest.mock('lib/events/consumers/getNftInfoForAttachment', () => ({
  getNFTInfoForAttachment: jest.fn(),
}));

const mockSendBotUpdateCall = sendBotMessage as jest.MockedFunction<
  typeof sendBotMessage
>;

const mockNFTInfoCall = getNFTInfoForAttachment as jest.MockedFunction<
  typeof getNFTInfoForAttachment
>;

const mockMessageEmbedCall =
  collateralToDiscordMessageEmbed as jest.MockedFunction<
    typeof collateralToDiscordMessageEmbed
  >;

describe('Formatting events for discord bot messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendBotUpdateCall.mockResolvedValue();
    mockMessageEmbedCall.mockResolvedValue(undefined);
    mockNFTInfoCall.mockResolvedValue(null);
  });

  describe('CreateEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'CreateEvent',
        subgraphCreateEvent,
        configs.rinkeby,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x0dd7d has created a loan with collateral: monarchs #147',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('2.0%'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        undefined,
      );
    });
  });

  describe('LendEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'LendEvent',
        subgraphLendEvent,
        configs.rinkeby,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been lent to by 0x7e646',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('2.0%'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        undefined,
      );
    });
  });

  describe('BuyoutEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'BuyoutEvent',
        subgraphBuyoutEvent,
        configs.rinkeby,
        {
          ...subgraphLendEvent,
          loanAmount: '8000000000000000000000',
          timestamp: subgraphLendEvent.timestamp - 86400 * 2,
        },
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been bought out by 0x7e646',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x10359 held the loan for 2 days and earned 0.00000000000001 DAI over that time',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8000.0 DAI'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('2.0%'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8193.0 DAI'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        undefined,
      );
    });
  });

  describe('RepaymentEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'RepaymentEvent',
        subgraphRepaymentEvent,
        configs.rinkeby,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been repaid by 0x0dd7d',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('2.0%'),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        undefined,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
        configs.rinkeby,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has had its collateral seized',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          "0x7e646 held the loan for 53 minutes. The loan became due on 01/01/1970 with a repayment cost of 8245.73952 DAI. 0x0dd7d did not repay, so 0x7e646 was able to seize the loan's collateral",
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        undefined,
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        undefined,
      );
    });
  });
});
