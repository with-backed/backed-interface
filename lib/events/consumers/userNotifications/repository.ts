import { PrismaClient, NotificationRequest } from '@prisma/client';
import { NotificationTriggerType, NotificationMethod } from './shared';

const prisma = new PrismaClient();

export async function createNotificationRequestForAddress(
  address: string,
  event: NotificationTriggerType,
  method: NotificationMethod,
  destination: string,
): Promise<NotificationRequest | null> {
  try {
    const createdNotificationRequest = await prisma.notificationRequest.create({
      data: {
        ethAddress: address,
        deliveryMethod: method,
        deliveryDestination: destination,
        event,
      },
    });
    return createdNotificationRequest;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleteNotificationRequestById(
  id: number,
): Promise<boolean> {
  try {
    await prisma.notificationRequest.delete({
      where: { id },
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function deleteAllNotificationRequestsForAddress(
  address: string,
): Promise<boolean> {
  try {
    await prisma.notificationRequest.deleteMany({
      where: { ethAddress: address },
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getNotificationRequestsForAddress(
  address: string,
  event: NotificationTriggerType = 'All',
): Promise<NotificationRequest[]> {
  try {
    return await prisma.notificationRequest.findMany({
      where: { ethAddress: address, event },
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getNumberOfRequestsForNotificationDestination(
  notificationDestination: string,
): Promise<number | null> {
  try {
    const reqs = await prisma.notificationRequest.findMany({
      where: { deliveryDestination: notificationDestination },
    });
    console.log({ reqs });
    return reqs.length;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function overrideLastWrittenTimestamp(
  lastWrittenTimestamp: number,
) {
  const lastTimestampObj =
    await prisma.lastTimestampForNotifications.findFirst();

  if (!lastTimestampObj) {
    await prisma.lastTimestampForNotifications.create({
      data: { lastWrittenTimestamp },
    });
    return;
  }

  await prisma.lastTimestampForNotifications.update({
    data: { lastWrittenTimestamp },
    where: { id: lastTimestampObj.id },
  });
}

export async function getLastWrittenTimestamp(): Promise<number | null> {
  try {
    const timestampObj = await prisma.lastTimestampForNotifications.findFirst();
    return timestampObj!.lastWrittenTimestamp;
  } catch (e) {
    console.error(e);
    return null;
  }
}
