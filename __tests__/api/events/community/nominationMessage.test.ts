import { createMocks } from 'node-mocks-http';
import { sendBotMessage } from 'lib/events/consumers/discord/bot';
import handler from 'pages/api/events/community/nominationMessage';
import { ethers } from 'ethers';

const address = ethers.Wallet.createRandom();

jest.mock('lib/events/consumers/discord/bot', () => ({
  sendBotMessage: jest.fn(),
}));

const mockSendBotMessage = sendBotMessage as jest.MockedFunction<
  typeof sendBotMessage
>;

describe('Nomination Discord bot message', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('successfully calls discord bot method', async () => {
    mockSendBotMessage.mockResolvedValue();

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        ethAddress: address,
        category: 'CONTRIBUTOR',
        value: 3,
        reason: 'Stellar code contribution',
      },
    });
    req.body = JSON.stringify(req.body);
    await handler(req, res);

    expect(mockSendBotMessage).toHaveBeenCalledTimes(1);
  });
});
