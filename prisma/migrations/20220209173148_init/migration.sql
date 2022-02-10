-- CreateTable
CREATE TABLE "NotificationRequest" (
    "id" SERIAL NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "deliveryDestination" TEXT NOT NULL,

    CONSTRAINT "NotificationRequest_pkey" PRIMARY KEY ("id")
);
