import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as nextRouter from 'next/router';
import { NetworkSelector } from 'components/NetworkSelector';

jest.spyOn(nextRouter, 'useRouter');

const mockedUseRouter = nextRouter.useRouter as jest.MockedFunction<
  typeof nextRouter.useRouter
>;
const push = jest.fn();
mockedUseRouter.mockImplementation(() => ({ push } as any));

describe('Select', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders, setting the current value to the current network', () => {
    const { getByText } = render(<NetworkSelector />);

    getByText('Rinkeby');
  });

  describe('network selection', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does nothing if you select the current network', () => {
      const { getByText, queryAllByText } = render(<NetworkSelector />);

      const input = getByText('Rinkeby');

      userEvent.click(input);

      // There are two instances of "Rinkeby"; one in the value part of the
      // select and one in the list. We want the one in the list.
      const rinkebys = queryAllByText('Rinkeby')!;
      const rinkeby = rinkebys[1];
      userEvent.click(rinkeby);

      expect(push).not.toHaveBeenCalled();
    });

    it('handles selection', () => {
      const { getByText } = render(<NetworkSelector />);

      const input = getByText('Rinkeby');

      userEvent.click(input);

      const optimism = getByText('Optimism');
      userEvent.click(optimism);

      expect(push).toHaveBeenCalledWith('/network/optimism');
      expect(push).toHaveBeenCalledTimes(1);
    });
  });
});
