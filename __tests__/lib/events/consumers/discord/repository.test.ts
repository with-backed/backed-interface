import {
  DiscordMetric,
  getDiscordMetric,
  resetDiscordMetrics,
  setDiscordMetric,
} from 'lib/events/consumers/discord/repository';

describe('Discord metrics repository', () => {
  afterEach(async () => {
    await resetDiscordMetrics();
  });

  describe('getter and setter methods', () => {
    it('increments numLoansCreated metric', async () => {
      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_CREATED)).toEqual(
        0,
      );
      await setDiscordMetric(DiscordMetric.NUM_LOANS_CREATED, 1);
      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_CREATED)).toEqual(
        1,
      );
    });
    it('increments numLoansLentTo metric', async () => {
      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_LENT_TO)).toEqual(
        0,
      );
      await setDiscordMetric(DiscordMetric.NUM_LOANS_LENT_TO, 1);
      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_LENT_TO)).toEqual(
        1,
      );
    });
    it('increments dollarLoansLentTo metric', async () => {
      expect(
        await getDiscordMetric(DiscordMetric.DOLLAR_LOANS_LENT_TO),
      ).toEqual(0);
      await setDiscordMetric(DiscordMetric.DOLLAR_LOANS_LENT_TO, 1);
      expect(
        await getDiscordMetric(DiscordMetric.DOLLAR_LOANS_LENT_TO),
      ).toEqual(1);
    });
  });

  describe('resetDiscordMetrics', () => {
    it('resets discord metrics', async () => {
      await setDiscordMetric(DiscordMetric.NUM_LOANS_CREATED, 1);
      await setDiscordMetric(DiscordMetric.NUM_LOANS_LENT_TO, 1);
      await setDiscordMetric(DiscordMetric.DOLLAR_LOANS_LENT_TO, 1);

      await resetDiscordMetrics();

      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_CREATED)).toEqual(
        0,
      );
      expect(await getDiscordMetric(DiscordMetric.NUM_LOANS_LENT_TO)).toEqual(
        0,
      );
      expect(
        await getDiscordMetric(DiscordMetric.DOLLAR_LOANS_LENT_TO),
      ).toEqual(0);
    });
  });
});
