import { PrismaClient, NotificationRequest } from '@prisma/client';
import { NotificationEventTrigger, NotificationMethod } from './shared';

const prisma = new PrismaClient();

export async function createNotificationRequestForAddress(
  address: string,
  event: NotificationEventTrigger,
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
  event: NotificationEventTrigger = NotificationEventTrigger.ALL,
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
