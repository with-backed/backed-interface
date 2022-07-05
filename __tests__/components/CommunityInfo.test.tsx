import React from 'react';
import { render } from '@testing-library/react';
import { CommunityInfo } from 'components/CommunityInfo';

// Mocking this because next/image doesn't play nicely with __mocks__/fileMock.js
jest.mock(
  'next/image',
  () =>
    function Image() {
      return <span />;
    },
);

describe('CommunityInfo', () => {
  it('renders', () => {
    const { getByText } = render(<CommunityInfo />);

    getByText('Automatically Awarded XP');
    getByText('Nominated XP');
    getByText('Special Traits');
  });
});
