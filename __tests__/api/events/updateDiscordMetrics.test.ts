import { getUnitPriceForCoin } from 'lib/coingecko';
import { updateWatcher } from 'lib/events/consumers/discord/bot';
import { DiscordMetric } from 'lib/events/consumers/discord/shared';
import {
  getCreatedLoansPastWeek,
  getLentToLoansPastWeek,
} from 'lib/loans/subgraph/subgraphLoans';
import { subgraphLoan } from 'lib/mockData';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/updateDiscordMetrics';

jest.mock('lib/events/consumers/discord/bot', () => ({
  updateWatcher: jest.fn(),
}));

jest.mock('lib/loans/subgraph/subgraphLoans', () => ({
  getCreatedLoansPastWeek: jest.fn(),
  getLentToLoansPastWeek: jest.fn(),
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

const mockGetCreatedLoansCall = getCreatedLoansPastWeek as jest.MockedFunction<
  typeof getCreatedLoansPastWeek
>;
const mockGetLentToLoansCall = getLentToLoansPastWeek as jest.MockedFunction<
  typeof getLentToLoansPastWeek
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
