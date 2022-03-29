import { sendBotUpdateForTriggerAndEntity } from 'lib/events/consumers/discord/formatter';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphCreateEvent,
  subgraphLendEvent,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import { collateralToDiscordMessageEmbed } from 'lib/events/consumers/discord/imageAttachmentHelper';
import { MessageEmbed } from 'discord.js';

jest.mock('lib/events/consumers/discord/bot', () => ({
  sendBotMessage: jest.fn(),
}));

jest.mock('lib/events/consumers/discord/imageAttachmentHelper', () => ({
  collateralToDiscordMessageEmbed: jest.fn(),
}));

const mockSendBotUpdateCall = sendBotMessage as jest.MockedFunction<
  typeof sendBotMessage
>;

const mockImageAttachmentCall =
  collateralToDiscordMessageEmbed as jest.MockedFunction<
    typeof collateralToDiscordMessageEmbed
  >;

const now = 1647357808;

describe('Formatting events for discord bot messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendBotUpdateCall.mockResolvedValue();
    mockImageAttachmentCall.mockResolvedValue(new MessageEmbed());
  });

  describe('CreateEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'CreateEvent',
        subgraphCreateEvent,
        now,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x0dd7d has created a loan with collateral: monarchs #147',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
    });
  });

  describe('LendEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'LendEvent',
        subgraphLendEvent,
        now,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been lent to by 0x7e646',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
    });
  });

  describe('BuyoutEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'BuyoutEvent',
        subgraphBuyoutEvent,
        now,
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
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          '0x10359 held the loan for 2 days and earned 0.00000000000001 DAI over that time',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8000.0 DAI'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8193.0 DAI'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
    });
  });

  describe('RepaymentEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'RepaymentEvent',
        subgraphRepaymentEvent,
        now,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has been repaid by 0x0dd7d',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('8192.0 DAI'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('120 days'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining('6.3072%'),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    it('Correctly formats event for discord message', async () => {
      await sendBotUpdateForTriggerAndEntity(
        'CollateralSeizureEvent',
        subgraphCollateralSeizureEvent,
        now,
      );

      expect(mockSendBotUpdateCall).toHaveBeenCalledTimes(1);
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan #65: monarchs has had its collateral seized',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          "0x7e646 held the loan for 53 minutes. The loan became due on 01/01/1970 with a repayment cost of 8361.869312 DAI. 0x0dd7d did not repay, so 0x7e646 was able to seize the loan's collateral",
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Loan: <https://rinkeby.withbacked.xyz/loans/65>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
      expect(mockSendBotUpdateCall).toHaveBeenCalledWith(
        expect.stringContaining(
          'Event Tx: <https://rinkeby.etherscan.io/tx/0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6>',
        ),
        expect.objectContaining({
          url: null,
        }),
      );
    });
  });
});
