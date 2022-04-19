import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum Metric {
  EMAILS_PAST_DAY = 'emailsSentPastDay',
}

const INITIAL_METRICS = {
  [Metric.EMAILS_PAST_DAY]: 0,
};

export async function getBackedMetric(metricName: Metric) {
  const metrics = await prisma.backedMetrics.findFirst();

  return metrics ? metrics[metricName] : 0;
}

export async function setBackedMetric(metricName: Metric, value: number) {
  const metrics = await prisma.backedMetrics.findFirst();

  if (!metrics) {
    await prisma.backedMetrics.create({
      data: {
        ...INITIAL_METRICS,
        [metricName]: value,
      },
    });
    return;
  }

  await prisma.backedMetrics.update({
    data: { [metricName]: value },
    where: { id: metrics.id },
  });
}

export async function resetBackedMetrics() {
  const metrics = await prisma.backedMetrics.findFirst();

  if (!metrics) return;

  await prisma.backedMetrics.update({
    data: INITIAL_METRICS,
    where: { id: metrics.id },
  });
}
