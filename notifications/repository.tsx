import { PrismaClient, NotificationRequest } from '@prisma/client';

const prisma = new PrismaClient();

export enum NotificationMethod {
  EMAIL = 'email',
}

export async function createNotificationRequestForAddress(
  address: string,
  event: string,
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

export async function deleteNotificationRequest(id: number): Promise<boolean> {
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
): Promise<NotificationRequest[]> {
  try {
    return await prisma.notificationRequest.findMany({
      where: { ethAddress: address },
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}
