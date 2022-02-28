import React from 'react';
import { render } from '@testing-library/react';
import { Input } from 'components/Input';

describe('Input', () => {
  it('renders', () => {
    const { container } = render(<Input />);
    expect(container.querySelectorAll('input')).toHaveLength(1);
  });
  it('renders with a unit', () => {
    const { container, getByText } = render(<Input unit="ETH" />);
    expect(container.querySelectorAll('input')).toHaveLength(1);
    getByText('ETH');
  });
});
