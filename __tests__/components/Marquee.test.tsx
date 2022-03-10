import React from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Marquee } from 'components/Marquee';

const messages = [
  <span key={1}>hello</span>,
  <span key={2}>another message</span>,
];

describe('Marquee', () => {
  it('renders', () => {
    const { getAllByText } = render(<Marquee messages={messages} />);
    getAllByText('hello');
    getAllByText('another message');
  });

  it('toggles scrolling on click', () => {
    const { getAllByText, container } = render(
      <Marquee startsPaused={false} messages={messages} />,
    );
    const hellos = getAllByText('hello');

    expect(container.querySelector('.paused')).toBeNull();

    act(() => userEvent.click(hellos[0]));

    expect(container.querySelector('.paused')).not.toBeNull();
  });
});
