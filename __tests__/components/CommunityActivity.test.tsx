import React from 'react';
import { render } from '@testing-library/react';
import { CommunityActivity } from 'components/CommunityActivity';
import { CommunityAccount } from 'lib/community';

const account: CommunityAccount = {
  id: '0xe89cb2053a04daf86abaa1f4bc6d50744e57d39e',
  token: { id: '0', uri: 'some-uri' },
  categoryScoreChanges: [
    {
      id: '0x719952bc373e34fe932a2158a3221e6d4d3d078a694e15de42c9faca33173103-ACTIVITY-1',
      timestamp: 10,
      blockNumber: 0,
      category: {
        id: 'ACTIVITY',
        name: 'ACTIVITY',
        __typename: 'Category',
      },
      newScore: 10,
      oldScore: 3,
      ipfsEntryHash:
        '0x3d247a03b5e54756fc02c5b5ab02fc572b152431d3915796ae55c651267e80ce',
      __typename: 'CategoryScoreChange',
    },
    {
      id: '0x719952bc373e34fe932a2158a3221e6d4d3d078a694e15de42c9faca33173103-CONTRIBUTOR-1',
      timestamp: 20,
      blockNumber: 0,
      category: {
        id: 'CONTRIBUTOR',
        name: 'CONTRIBUTOR',
        __typename: 'Category',
      },
      newScore: 1,
      oldScore: 0,
      ipfsEntryHash:
        '0xd75bb79201bd8206c1da4b0fc1e3c1dd2438fbdc9df6c069d0dc8e2c57a1fa47',
      __typename: 'CategoryScoreChange',
    },
    {
      id: '0xca9944c910879c97efebc04d1919d558cf8c040207496670d085e639427a9351-COMMUNITY-1',
      timestamp: 30,
      blockNumber: 0,
      category: {
        id: 'COMMUNITY',
        name: 'COMMUNITY',
        __typename: 'Category',
      },
      newScore: 1,
      oldScore: 0,
      ipfsEntryHash:
        '0xe77af91361d772979e2aeaa11aa5bad8ba186b3a10deec222be8d58a872ef14a',
      __typename: 'CategoryScoreChange',
    },
  ] as any,
};

describe('CommunityActivity', () => {
  it('renders null when there is no account', () => {
    const { container } = render(<CommunityActivity account={null} />);

    expect(container.childElementCount).toEqual(0);
  });

  it('renders a sorted feed of activity', () => {
    const { getAllByTestId } = render(<CommunityActivity account={account} />);

    const events = getAllByTestId('event', { exact: false });
    expect(events).toHaveLength(3);
    expect(events[0]).toHaveTextContent('COMMUNITY 1XP 12/31/1969');
    expect(events[1]).toHaveTextContent('CONTRIBUTOR 1XP 12/31/1969');
    expect(events[2]).toHaveTextContent('ACTIVITY 7XP 12/31/1969');
  });
});
