import {
  getOldestLendEventForUser,
  getOldestRepaymentEventForUser,
} from 'lib/eventsHelpers';
import axios from 'axios';
import {
  subgraphLendEvent,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/consumers/communityNFTAwarder';

jest.mock('lib/eventsHelpers', () => ({
  getOldestLendEventForUser: jest.fn(),
  getOldestRepaymentEventForUser: jest.fn(),
}));

jest.mock('axios', () => ({
  post: jest.fn(),
}));

const mockGetOldestLend = getOldestLendEventForUser as jest.MockedFunction<
  typeof getOldestLendEventForUser
>;

const mockGetOldestRepayment =
  getOldestRepaymentEventForUser as jest.MockedFunction<
    typeof getOldestRepaymentEventForUser
  >;

const mockAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('Community NFT Awarder consumer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('Lend Event', () => {
    it('successfully calls community NFT API when it is users first lend event', async () => {
      mockGetOldestLend.mockResolvedValue(subgraphLendEvent);
      mockAxiosPost.mockResolvedValueOnce({ status: 200 });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          Message: JSON.stringify({
            eventName: 'LendEvent',
            event: {
              id: subgraphLendEvent.id,
              loan: {
                lendTicketHolder: subgraphLendEvent.loan.lendTicketHolder,
              },
            },
            mostRecentTermsEvent: subgraphLendEvent,
            network: 'rinkeby',
          }),
        },
      });
      req.body = JSON.stringify(req.body);
      await handler(req, res);

      expect(mockGetOldestLend).toHaveBeenCalled();
      expect(mockAxiosPost).toHaveBeenCalled();
    });

    it('does not call Community NFT API when user has already had a lend event', async () => {
      mockGetOldestLend.mockResolvedValue(subgraphLendEvent);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          Message: JSON.stringify({
            eventName: 'LendEvent',
            event: {
              id: 'random-id',
              loan: {
                lendTicketHolder: subgraphLendEvent.loan.lendTicketHolder,
              },
            },
            mostRecentTermsEvent: subgraphLendEvent,
            network: 'rinkeby',
          }),
        },
      });
      req.body = JSON.stringify(req.body);
      await handler(req, res);

      expect(mockGetOldestLend).toHaveBeenCalled();
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });

  describe('Repayment Event', () => {
    it('successfully calls community NFT API when it is users first lend event', async () => {
      mockGetOldestRepayment.mockResolvedValue(subgraphRepaymentEvent);
      mockAxiosPost.mockResolvedValueOnce({ status: 200 });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          Message: JSON.stringify({
            eventName: 'RepaymentEvent',
            event: {
              id: subgraphRepaymentEvent.id,
              loan: {
                borrowTicketHolder: subgraphLendEvent.loan.borrowTicketHolder,
              },
            },
            mostRecentTermsEvent: subgraphLendEvent,
            network: 'rinkeby',
          }),
        },
      });
      req.body = JSON.stringify(req.body);
      await handler(req, res);

      expect(mockGetOldestRepayment).toHaveBeenCalled();
      expect(mockAxiosPost).toHaveBeenCalled();
    });

    it('does not call Community NFT API when user has already had a lend event', async () => {
      mockGetOldestRepayment.mockResolvedValue(subgraphRepaymentEvent);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          Message: JSON.stringify({
            eventName: 'RepaymentEvent',
            event: {
              id: 'random-id',
              loan: {
                lendTicketHolder: subgraphLendEvent.loan.lendTicketHolder,
              },
            },
            mostRecentTermsEvent: subgraphLendEvent,
            network: 'rinkeby',
          }),
        },
      });
      req.body = JSON.stringify(req.body);
      await handler(req, res);

      expect(mockGetOldestRepayment).toHaveBeenCalled();
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });
});
