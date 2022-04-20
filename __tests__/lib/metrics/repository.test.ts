import {
  Metric,
  getBackedMetric,
  resetBackedMetrics,
  setBackedMetric,
} from 'lib/metrics/repository';

describe('Backed metrics repository', () => {
  beforeEach(async () => {
    await resetBackedMetrics();
  });
  afterEach(async () => {
    await resetBackedMetrics();
  });

  describe('getter and setter methods', () => {
    it('increments emailsSentPastDay metric', async () => {
      expect(await getBackedMetric(Metric.EMAILS_PAST_DAY)).toEqual(0);
      await setBackedMetric(Metric.EMAILS_PAST_DAY, 1);
      expect(await getBackedMetric(Metric.EMAILS_PAST_DAY)).toEqual(1);
    });
  });

  describe('resetBackedMetrics', () => {
    it('resets backed metrics', async () => {
      await setBackedMetric(Metric.EMAILS_PAST_DAY, 1);

      await resetBackedMetrics();

      expect(await getBackedMetric(Metric.EMAILS_PAST_DAY)).toEqual(0);
    });
  });
});
