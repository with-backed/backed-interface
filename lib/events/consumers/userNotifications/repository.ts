import { PrismaClient, NotificationRequest } from '@prisma/client';
import { ethers } from 'ethers';
import { NotificationTriggerType, NotificationMethod } from './shared';

const prisma = new PrismaClient();

export async function createNotificationRequestForAddress(
  address: string,
  event: NotificationTriggerType,
  method: NotificationMethod,
  destination: string,
): Promise<NotificationRequest | null> {
  try {
    const existingRequests = await getNotificationRequestsForAddress(address);
    const duplicateRequest = existingRequests.find(
      (r) => r.deliveryDestination === destination,
    );
    if (!!duplicateRequest) {
      return duplicateRequest;
    }

    const createdNotificationRequest = await prisma.notificationRequest.create({
      data: {
        ethAddress: ethers.utils.getAddress(address),
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
  id: string,
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
      where: { ethAddress: ethers.utils.getAddress(address) },
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
      where: { ethAddress: ethers.utils.getAddress(address), event },
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
