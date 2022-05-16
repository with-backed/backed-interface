import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { LoanGalleryLoadMore } from 'components/LoanGalleryLoadMore';

describe('LoanGalleryLoadMore', () => {
  it('renders a button when ready to load', () => {
    const loadMore = jest.fn();
    const { getByText } = render(
      <LoanGalleryLoadMore
        isLoadingMore={false}
        isReachingEnd={false}
        loadMore={loadMore}
      />,
    );

    const button = getByText('Load More');
    expect(loadMore).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(loadMore).toHaveBeenCalled();
  });

  it('renders a loading state', () => {
    const loadMore = jest.fn();
    const { getByText } = render(
      <LoanGalleryLoadMore
        isLoadingMore
        isReachingEnd={false}
        loadMore={loadMore}
      />,
    );

    const button = getByText('Loading...');
    fireEvent.click(button);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it('renders an end state when there is nothing left to load', () => {
    const loadMore = jest.fn();
    const { getByText } = render(
      <LoanGalleryLoadMore
        isLoadingMore={false}
        isReachingEnd
        loadMore={loadMore}
      />,
    );

    const button = getByText("That's all, folks");
    fireEvent.click(button);
    expect(loadMore).not.toHaveBeenCalled();
  });
});
