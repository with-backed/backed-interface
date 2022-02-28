import { NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import {
  BUYOUT_EVENT_PROPERTIES,
  COLLATERAL_SEIZURE_EVENT_PROPERTIES,
  LEND_EVENT_PROPERTIES,
  REPAY_EVENT_PROPERTIES,
} from 'lib/loans/subgraph/subgraphSharedConstants';
import { subgraphLoan } from 'lib/mockData';
import { sendEmail } from 'lib/notifications/emails';
import { getEventFromTxHash } from 'lib/notifications/events';
import { getNotificationRequestsForAddress } from 'lib/notifications/repository';
import {
  NotificationEventTrigger,
  NotificationMethod,
} from 'lib/notifications/shared';
import { createMocks } from 'node-mocks-http';
import handler from 'pages/api/events/[event]';
import {
  BuyoutEvent,
  CollateralSeizureEvent,
  LendEvent,
  RepaymentEvent,
} from 'types/generated/graphql/nftLoans';

const subgraphLoanCopy = Object.assign({}, subgraphLoan);
subgraphLoanCopy.lendTicketHolder =
  ethers.Wallet.createRandom().address.toLowerCase();

const event = NotificationEventTrigger.ALL;
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

const returnedNotificationRequest: NotificationRequest = {
  id: 1,
  ethAddress: '', // we don't care what this is for these tests
  deliveryDestination: notificationDestination,
  deliveryMethod: notificationMethod,
  event,
};

jest.mock('lib/notifications/events', () => ({
  getEventFromTxHash: jest.fn(),
}));

jest.mock('lib/notifications/emails', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('lib/notifications/repository', () => ({
  getNotificationRequestsForAddress: jest.fn(),
}));

const mockedGetNotificationsCall =
  getNotificationRequestsForAddress as jest.MockedFunction<
    typeof getNotificationRequestsForAddress
  >;

const mockedGetEventFromGraphCall = getEventFromTxHash as jest.MockedFunction<
  typeof getEventFromTxHash
>;

const mockedSendEmailCall = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/events/[event]', () => {
  const txHash = 'random-hash';

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedGetNotificationsCall.mockResolvedValue([returnedNotificationRequest]);
    mockedSendEmailCall.mockResolvedValue();
  });

  describe('BuyoutEventOldLender', () => {
    beforeEach(async () => {
      mockedGetEventFromGraphCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve({
            lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
            loan: subgraphLoanCopy,
          } as BuyoutEvent);
        }),
      );
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'BuyoutEventOldLender',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetEventFromGraphCall).toHaveBeenCalledTimes(1);
      expect(mockedGetEventFromGraphCall).toHaveBeenCalledWith(
        txHash,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.lendTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.BuyoutEventOldLender,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
      );
    });
  });

  describe('BuyoutEventBorrower', () => {
    beforeEach(async () => {
      mockedGetEventFromGraphCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve({
            loan: subgraphLoanCopy,
          } as BuyoutEvent);
        }),
      );
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'BuyoutEventBorrower',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetEventFromGraphCall).toHaveBeenCalledTimes(1);
      expect(mockedGetEventFromGraphCall).toHaveBeenCalledWith(
        txHash,
        'buyoutEvent',
        BUYOUT_EVENT_PROPERTIES,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.BuyoutEventBorrower,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });

  describe('LendEvent', () => {
    beforeEach(async () => {
      mockedGetEventFromGraphCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve({
            borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
            loan: subgraphLoanCopy,
          } as LendEvent);
        }),
      );
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'LendEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetEventFromGraphCall).toHaveBeenCalledTimes(1);
      expect(mockedGetEventFromGraphCall).toHaveBeenCalledWith(
        txHash,
        'lendEvent',
        LEND_EVENT_PROPERTIES,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.LendEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });

  describe('RepaymentEvent', () => {
    beforeEach(async () => {
      mockedGetEventFromGraphCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve({
            lendTicketHolder: subgraphLoanCopy.lendTicketHolder,
            loan: subgraphLoanCopy,
          } as RepaymentEvent);
        }),
      );
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'RepaymentEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetEventFromGraphCall).toHaveBeenCalledTimes(1);
      expect(mockedGetEventFromGraphCall).toHaveBeenCalledWith(
        txHash,
        'repaymentEvent',
        REPAY_EVENT_PROPERTIES,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.lendTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.RepaymentEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.lendTicketHolder}`,
      );
    });
  });

  describe('CollateralSeizureEvent', () => {
    beforeEach(async () => {
      mockedGetEventFromGraphCall.mockReturnValue(
        new Promise((resolve, _reject) => {
          resolve({
            borrowTicketHolder: subgraphLoanCopy.borrowTicketHolder,
            loan: subgraphLoanCopy,
          } as CollateralSeizureEvent);
        }),
      );
    });

    it('makes call to the graph, gets notifications associated with address, and sends email', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: {
          event: 'CollateralSeizureEvent',
        },
        body: {
          txHash,
        },
      });

      await handler(req, res);

      expect(mockedGetEventFromGraphCall).toHaveBeenCalledTimes(1);
      expect(mockedGetEventFromGraphCall).toHaveBeenCalledWith(
        txHash,
        'collateralSeizureEvent',
        COLLATERAL_SEIZURE_EVENT_PROPERTIES,
      );

      expect(mockedGetNotificationsCall).toHaveBeenCalledTimes(1);
      expect(mockedGetNotificationsCall).toHaveBeenCalledWith(
        subgraphLoanCopy.borrowTicketHolder,
      );

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        notificationDestination,
        NotificationEventTrigger.CollateralSeizureEvent,
        subgraphLoanCopy,
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        `notifications successfully sent to ${subgraphLoanCopy.borrowTicketHolder}`,
      );
    });
  });
});
