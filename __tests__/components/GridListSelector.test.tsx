import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridListSelector } from 'components/GridListSelector';

const handleChange = jest.fn();

describe('GridListSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders', () => {
    const { getByRole } = render(
      <GridListSelector handleChange={handleChange} />,
    );

    getByRole('checkbox');
  });

  it('calls handleChange when clicked', () => {
    const { getByRole } = render(
      <GridListSelector handleChange={handleChange} />,
    );

    expect(handleChange).not.toHaveBeenCalled();

    const selector = getByRole('checkbox');

    userEvent.click(selector);
    expect(handleChange).toHaveBeenCalledWith(false);

    userEvent.click(selector);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
