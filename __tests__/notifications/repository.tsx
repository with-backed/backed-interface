import {
  createNotificationRequestForAddress,
  deleteAllNotificationRequestsForAddress,
  deleteNotificationRequestById,
  getNotificationRequestsForAddress,
  NotificationMethod,
} from 'notifications/repository';

const address = '0x7e6463782b87c57cffa6af66e7c2de64e97d1866';
const event = '';
const notificationMethod = NotificationMethod.EMAIL;
const notificationDestination = 'adamgobes@gmail.com';

describe('Notifications repository', () => {
  it('succesfully creates a new notification request for a given eth address', async () => {
    const notificationRequest = await createNotificationRequestForAddress(
      address,
      event,
      notificationMethod,
      notificationDestination,
    );

    expect(notificationRequest!.ethAddress).toEqual(address);
    expect(notificationRequest!.event).toEqual(event);
    expect(notificationRequest!.deliveryMethod).toEqual(notificationMethod);
    expect(notificationRequest!.deliveryDestination).toEqual(
      notificationDestination,
    );

    const deleteResult = await deleteNotificationRequestById(
      notificationRequest!.id,
    );
    expect(deleteResult).toBeTruthy;
  });

  it('succesfully gets all notification requests for a user', async () => {
    const first = await createNotificationRequestForAddress(
      address,
      event,
      notificationMethod,
      notificationDestination,
    );

    const second = await createNotificationRequestForAddress(
      address,
      event,
      notificationMethod,
      'anotherEmail@gmail.com',
    );

    const requestsForAddress = await getNotificationRequestsForAddress(address);
    expect(requestsForAddress.length).toEqual(2);
    expect(requestsForAddress[0].deliveryDestination).toEqual(
      'adamgobes@gmail.com',
    );
    expect(requestsForAddress[1].deliveryDestination).toEqual(
      'anotherEmail@gmail.com',
    );

    await deleteNotificationRequestById(first!.id);
    await deleteNotificationRequestById(second!.id);
  });

  it('succesfully deletes all notification requests for an address should they choose to opt out', async () => {
    await createNotificationRequestForAddress(
      address,
      event,
      notificationMethod,
      notificationDestination,
    );

    await createNotificationRequestForAddress(
      address,
      event,
      notificationMethod,
      'anotherEmail@gmail.com',
    );

    const deleteAllResult = await deleteAllNotificationRequestsForAddress(
      address,
    );
    expect(deleteAllResult).toBeTruthy;
    expect((await getNotificationRequestsForAddress(address)).length).toEqual(
      0,
    );
  });
});
