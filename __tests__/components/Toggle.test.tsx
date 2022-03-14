import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from 'components/Toggle';

const handleChange = jest.fn();

describe('Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders', () => {
    const { getByText } = render(
      <Toggle handleChange={handleChange} left="Left" right="Right" />,
    );
    getByText('Left');
    getByText('Right');
  });

  it('calls handleChange when clicked', () => {
    const { getByRole } = render(
      <Toggle handleChange={handleChange} left="Left" right="Right" />,
    );

    expect(handleChange).not.toHaveBeenCalled();

    const selector = getByRole('checkbox');

    userEvent.click(selector);
    expect(handleChange).toHaveBeenCalledWith(false);

    userEvent.click(selector);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
