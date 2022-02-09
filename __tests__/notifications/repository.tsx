import {
  createNotificationRequestForAddress,
  deleteNotificationRequest,
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

    const deleteResult = await deleteNotificationRequest(
      notificationRequest!.id,
    );
    expect(deleteResult).toBeTruthy;
  });
});
