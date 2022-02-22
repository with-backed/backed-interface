import { main } from './dailyCron';

// code that will be called from Github actions or Tenderly
// TODO(adamgobes): Hook this up to github actions or tenderly once we decide what we're going with
// TODO(adamgobes): Populate NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS and NEXT_PUBLIC_NOTIFICATIONS_TIMESTAMP_FILENAME

main(new Date().getTime() / 1000)
  .catch((e) => {
    throw e;
  })
  .finally(() => {
    console.log('script finished running');
  });
