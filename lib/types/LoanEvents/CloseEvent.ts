import { BaseLoanEvent } from './BaseLoanEvent';

export type CloseLoanEvent = BaseLoanEvent & {
  kind: 'close';
};
