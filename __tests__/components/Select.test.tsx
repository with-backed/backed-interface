import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from 'components/Select';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const onChange = jest.fn();

describe('Select', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders without options', () => {
    render(<Select options={[]} onChange={onChange} />);
  });

  it('renders with options, setting the default to the first option', () => {
    const { getByText } = render(
      <Select options={options} onChange={onChange} />,
    );

    getByText('Chocolate');
  });

  it('renders in a disabled state', () => {
    const { getByText } = render(
      <Select options={options} onChange={onChange} isDisabled />,
    );

    const input = getByText('Chocolate');

    expect(() => userEvent.click(input)).toThrow();
  });

  it('handles selection', () => {
    const { getByText } = render(
      <Select options={options} onChange={onChange} />,
    );

    const input = getByText('Chocolate');

    userEvent.click(input);

    const strawberry = getByText('Strawberry');
    userEvent.click(strawberry);

    expect(onChange).toHaveBeenCalledWith(
      {
        label: 'Strawberry',
        value: 'strawberry',
      },
      expect.any(Object),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
