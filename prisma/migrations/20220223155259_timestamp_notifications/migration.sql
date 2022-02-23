-- CreateTable
CREATE TABLE "LastTimestampForNotifications" (
    "id" SERIAL NOT NULL,
    "lastWrittenTimestamp" INTEGER NOT NULL,

    CONSTRAINT "LastTimestampForNotifications_pkey" PRIMARY KEY ("id")
);
