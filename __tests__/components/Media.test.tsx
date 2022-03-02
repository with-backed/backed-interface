import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Media } from 'components/Media';

const media = 'some media';
const autoPlay = false;

describe('Media', () => {
  it('renders a fallback when there is an error', () => {
    const { container } = render(
      <Media media={media} autoPlay={autoPlay} mediaMimeType="audio" />,
    );

    let fallback = container.querySelector('[data-testid=fallback]');
    expect(fallback).toBeNull();

    const audio = container.querySelector('audio');
    expect(audio).not.toBeNull();

    fireEvent.error(audio!);
    fallback = container.querySelector('[data-testid=fallback]');
    expect(fallback).not.toBeNull();
  });
});
