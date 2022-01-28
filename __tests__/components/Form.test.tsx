import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'components/Form';

describe('Form', () => {
  it('renders', () => {
    // preventDefault to silence JSDom error log about submit not being implemented
    const onSubmit = jest.fn().mockImplementation((e) => e.preventDefault());
    const { getByText, container } = render(
      <Form onSubmit={onSubmit}>
        <input type="text" value="hola" readOnly />
        <button type="submit">Submit</button>
      </Form>,
    );

    expect(onSubmit).not.toHaveBeenCalled();

    const button = getByText('Submit');
    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    userEvent.click(button);
    expect(onSubmit).toHaveBeenCalled();
  });
});
