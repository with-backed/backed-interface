import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum DiscordMetric {
  NUM_LOANS_CREATED = 'numLoansCreated',
  NUM_LOANS_LENT_TO = 'numLoansLentTo',
  DOLLAR_LOANS_LENT_TO = 'dollarLoansLentTo',
}

const INITIAL_METRICS = {
  [DiscordMetric.NUM_LOANS_CREATED]: 0,
  [DiscordMetric.NUM_LOANS_LENT_TO]: 0,
  [DiscordMetric.DOLLAR_LOANS_LENT_TO]: 0,
};

export async function getDiscordMetric(metricName: DiscordMetric) {
  const metrics = await prisma.discordMetrics.findFirst();

  return metrics ? metrics[metricName] : 0;
}

export async function setDiscordMetric(
  metricName: DiscordMetric,
  value: number,
) {
  const metrics = await prisma.discordMetrics.findFirst();

  if (!metrics) {
    await prisma.discordMetrics.create({
      data: {
        ...INITIAL_METRICS,
        [metricName]: value,
      },
    });
    return;
  }

  await prisma.discordMetrics.update({
    data: { [metricName]: value },
    where: { id: metrics.id },
  });
}

export async function resetDiscordMetrics() {
  const metrics = await prisma.discordMetrics.findFirst();

  if (!metrics) return;

  await prisma.discordMetrics.update({
    data: INITIAL_METRICS,
    where: { id: metrics.id },
  });
}
