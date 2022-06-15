import React from 'react';
import { LoanHeader } from 'components/LoanHeader';
import {
  baseLoan,
  closedLoan,
  loanWithLenderAccruing,
  loanWithLenderPastDue,
  now,
} from 'lib/mockData';
import { TimestampContext } from 'hooks/useTimestamp/useTimestamp';
import noop from 'lodash/noop';

export default {
  title: 'components/LoanHeader',
  component: LoanHeader,
  decorators: [
    (Story: any) => (
      <TimestampContext.Provider value={now}>
        <Story />
      </TimestampContext.Provider>
    ),
  ],
};

const collateralMedia = {
  mediaUrl:
    'https://nftpawnshop.mypinata.cloud/ipfs/QmfBX5znHic5TQ5NE6CEYpVfMNsdASYDRj1dMR7mqQUGuQ',
  mediaMimeType: 'video',
};

export function LoanHeaderAwaiting() {
  return (
    <LoanHeader
      loan={baseLoan}
      collateralMedia={collateralMedia}
      refresh={noop}
    />
  );
}

export function LoanHeaderWithLenderAccruing() {
  return (
    <LoanHeader
      loan={loanWithLenderAccruing}
      collateralMedia={collateralMedia}
      refresh={noop}
    />
  );
}

export function LoanHeaderWithLenderPastDue() {
  return (
    <LoanHeader
      loan={loanWithLenderPastDue}
      collateralMedia={collateralMedia}
      refresh={noop}
    />
  );
}

export function LoanHeaderClosed() {
  return (
    <LoanHeader
      loan={closedLoan}
      collateralMedia={collateralMedia}
      refresh={noop}
    />
  );
}
