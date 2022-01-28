import React from 'react';
import { render } from '@testing-library/react';
import { Explainer } from 'components/Explainer';

describe('Explainer', () => {
  it('renders its children in normal mode', () => {
    const { getByText, container } = render(
      <Explainer top={50}>
        <span>Hello!</span>
      </Explainer>,
    );

    expect(container.querySelector('.explainer')).not.toBeNull();
    getByText('Hello!');
  });
  it('renders its children in error mode', () => {
    const { getByText, container } = render(
      <Explainer top={50} display="error">
        <span>Uh oh!</span>
      </Explainer>,
    );

    expect(container.querySelector('.explainer-error')).not.toBeNull();
    getByText('Uh oh!');
  });
});
