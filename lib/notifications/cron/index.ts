import { main } from '../dailyCron';

main(new Date().getTime() / 1000)
  .catch((e) => {
    throw e;
  })
  .finally(() => {
    console.log('script finished running');
  });
