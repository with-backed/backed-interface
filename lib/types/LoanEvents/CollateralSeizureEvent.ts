import { BaseLoanEvent } from './BaseLoanEvent';

export type CollateralSeizureEvent = BaseLoanEvent & {
  kind: 'collateralSeizure';
};
