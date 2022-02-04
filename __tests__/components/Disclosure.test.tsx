import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Disclosure } from 'components/Disclosure';
import { DescriptionList } from 'components/DescriptionList';

const FullDisclosure = ({ subtitle }: { subtitle?: string }) => (
  <Disclosure title="Underwrite Loan" subtitle={subtitle}>
    <DescriptionList>
      <dt>Date</dt>
      <dd>March 32, 1942</dd>
    </DescriptionList>
  </Disclosure>
);

describe('Disclosure', () => {
  it('renders in a collapsed state', () => {
    const { getByText } = render(<FullDisclosure />);

    getByText('Underwrite Loan');
    expect(getByText('Date')).not.toBeVisible();
  });

  it('expands on click to show full content, and contracts on further click', () => {
    const { getByText } = render(<FullDisclosure />);

    const header = getByText('Underwrite Loan');
    userEvent.click(header);
    expect(getByText('Date')).toBeVisible();

    userEvent.click(header);
    expect(getByText('Date')).not.toBeVisible();
  });

  it('renders a subtitle when provided and the disclosure is closed', () => {
    const { getByText } = render(<FullDisclosure subtitle="Subtitle" />);

    getByText('Subtitle');
  });
});
