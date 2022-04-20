import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/cron/monitorEmailSends';
import {
  getBuyoutEventsSince,
  getCollateralSeizureEventsSince,
  getLendEventsSince,
  getRepaymentEventsSince,
  subgraphEventFromTxHash,
} from 'lib/eventsHelpers';
import {
  subgraphBuyoutEvent,
  subgraphCollateralSeizureEvent,
  subgraphLendEvent,
  subgraphRepaymentEvent,
} from 'lib/mockSubgraphEventsData';
import { getNotificationRequestsForAddress } from 'lib/events/consumers/userNotifications/repository';
import { NotificationRequest } from '@prisma/client';
import {
  NotificationMethod,
  NotificationTriggerType,
} from 'lib/events/consumers/userNotifications/shared';
import { getBackedMetric, resetBackedMetric } from 'lib/metrics/repository';
import { executeEmailSendWithSes } from 'lib/events/consumers/userNotifications/emails/ses';

jest.mock('lib/eventsHelpers', () => ({
  getLendEventsSince: jest.fn(),
  getBuyoutEventsSince: jest.fn(),
  getRepaymentEventsSince: jest.fn(),
  getCollateralSeizureEventsSince: jest.fn(),
  subgraphEventFromTxHash: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

jest.mock('lib/metrics/repository', () => ({
  ...jest.requireActual('lib/metrics/repository'),
  getBackedMetric: jest.fn(),
  resetBackedMetric: jest.fn(),
}));

jest.mock('lib/events/consumers/userNotifications/emails/ses', () => ({
  executeEmailSendWithSes: jest.fn(),
}));

const mockGetLends = getLendEventsSince as jest.MockedFunction<
  typeof getLendEventsSince
>;
const mockGetBuyouts = getBuyoutEventsSince as jest.MockedFunction<
  typeof getBuyoutEventsSince
>;
const mockGetRepayments = getRepaymentEventsSince as jest.MockedFunction<
  typeof getRepaymentEventsSince
>;
const mockGetCollateralSeizures =
  getCollateralSeizureEventsSince as jest.MockedFunction<
    typeof getCollateralSeizureEventsSince
  >;

const mockGetNotificationRequests =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const mockEventFromTxHash = subgraphEventFromTxHash as jest.MockedFunction<
  typeof subgraphEventFromTxHash
>;

const mockGetMetric = getBackedMetric as jest.MockedFunction<
  typeof getBackedMetric
>;

const mockResetMetric = resetBackedMetric as jest.MockedFunction<
  typeof resetBackedMetric
>;

const mockedSesEmailCall = executeEmailSendWithSes as jest.MockedFunction<
  typeof executeEmailSendWithSes
>;

const event: NotificationTriggerType = 'All';
const notificationMethod = NotificationMethod.EMAIL;
const testRecipientOne = 'adamgobes@gmail.com';
const testRecipientTwo = 'anotherEmail@gmail.com';

const notificationReqOne: NotificationRequest = {
  id: 'uuid-1',
  ethAddress: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
  deliveryDestination: testRecipientOne,
  deliveryMethod: notificationMethod,
  event,
};
const notificationReqTwo: NotificationRequest = {
  id: 'uuid-2',
  ethAddress: '0x7e6463782b87c57CFFa6AF66E7C2de64E97d1866',
  deliveryDestination: testRecipientTwo,
  deliveryMethod: notificationMethod,
  event,
};

describe('/api/events/cron/monitorEmailSends', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockGetLends.mockResolvedValue([subgraphLendEvent]);
    mockGetBuyouts.mockResolvedValue([subgraphBuyoutEvent]);
    mockGetRepayments.mockResolvedValue([subgraphRepaymentEvent]);
    mockGetCollateralSeizures.mockResolvedValue([
      subgraphCollateralSeizureEvent,
    ]);
    mockGetNotificationRequests.mockResolvedValue([
      notificationReqOne,
      notificationReqTwo,
    ]);
    mockEventFromTxHash.mockResolvedValue(null);
    mockGetMetric.mockResolvedValue(14);
    mockResetMetric.mockResolvedValue();
  });

  it('makes call to get subgraph events, gets notifications associated with addresses, and counts', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);
    expect(mockGetLends).toHaveBeenCalledTimes(1);
    expect(mockEventFromTxHash).toHaveBeenCalledTimes(1);
    expect(mockGetBuyouts).toHaveBeenCalledTimes(1);
    expect(mockGetRepayments).toHaveBeenCalledTimes(1);
    expect(mockGetCollateralSeizures).toHaveBeenCalledTimes(1);
    expect(mockResetMetric).toHaveBeenCalledTimes(1);

    expect(mockedSesEmailCall).toHaveBeenCalledTimes(1);
    expect(mockedSesEmailCall).toHaveBeenCalledWith(
      expect.stringContaining('Expected: 14\nActual: 14'),
      expect.anything(),
      expect.anything(),
    );
  });
});
