import { getUnitPriceForCoin } from 'lib/coingecko';
import { updateWatcher } from 'lib/events/consumers/discord/bot';
import { DiscordMetric } from 'lib/events/consumers/discord/shared';
import {
  getCreatedLoansSince,
  getLentToLoansSince,
} from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/network/[network]/events/updateDiscordMetrics';

jest.mock('lib/events/consumers/discord/bot', () => ({
  updateWatcher: jest.fn(),
}));

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getCreatedLoansSince: jest.fn(),
  getLentToLoansSince: jest.fn(),
}));

jest.mock('lib/coingecko', () => ({
  getUnitPriceForCoin: jest.fn(),
}));

const mockUnitPriceForCoin = getUnitPriceForCoin as jest.MockedFunction<
  typeof getUnitPriceForCoin
>;

const mockUpdateWatcherCall = updateWatcher as jest.MockedFunction<
  typeof updateWatcher
>;

const mockGetCreatedLoansCall = getCreatedLoansSince as jest.MockedFunction<
  typeof getCreatedLoansSince
>;
const mockGetLentToLoansCall = getLentToLoansSince as jest.MockedFunction<
  typeof getLentToLoansSince
>;

describe('/api/events/updateDiscordMetrics', () => {
  beforeEach(() => {
    mockGetCreatedLoansCall.mockResolvedValue([subgraphLoan]);
    mockGetLentToLoansCall.mockResolvedValue([
      {
        ...subgraphLoan,
        loanAmount: '8000000000000000000000',
      },
      {
        ...subgraphLoan,
        loanAmount: '4000000000000000000000',
      },
    ]);
    mockUnitPriceForCoin.mockResolvedValue(2);
    mockUpdateWatcherCall.mockResolvedValue();
  });

  it('calls updateWatcher with correct values', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: {
        network: 'rinkeby',
      },
    });

    await handler(req, res);

    expect(updateWatcher).toHaveBeenCalledTimes(3);
    expect(updateWatcher).toHaveBeenCalledWith(
      DiscordMetric.NUM_LOANS_CREATED,
      1,
    );
    expect(updateWatcher).toHaveBeenCalledWith(
      DiscordMetric.NUM_LOANS_LENT_TO,
      2,
    );
    expect(updateWatcher).toHaveBeenCalledWith(
      DiscordMetric.DOLLAR_LOANS_LENT_TO,
      24000,
    ); // 8000 * 2 + 4000 * 2

    expect(getUnitPriceForCoin).toHaveBeenCalledTimes(2);
  });
});
